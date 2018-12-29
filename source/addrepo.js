import select from 'select-dom';
import * as api from './libs/api';

const dgraph = require("dgraph-js-http");

// Create a client stub.
function newClientStub() {
    return new dgraph.DgraphClientStub(
        // addr: optional, default: "http://localhost:8080"
        "http://localhost:8080",
    );
}

// Create a client.
function newClient(clientStub) {
    return new dgraph.DgraphClient(clientStub);
}

function ownerAndRepo(inputText) {
    const inputParts = inputText.split('/');
    if (inputParts.length !== 2) throw "Must be in 'owner/repo' format"; 
    const owner = inputParts[0]; 
    const repo = inputParts[1];
    return {owner, repo};
}

async function ownerNode(txn, ownerName) {
    let ownerNode = {
        name: ownerName
    }

    let query = `query owners($ownerName: string) {
        owners(func: eq(name, $ownerName)) @filter(NOT has(org))
        {
            uid
        }
    }`;
    let vars = { $ownerName: ownerName };
    let res = await txn.queryWithVars(query, vars);
    let owners = res.data.owners;
    if (owners.length > 0) ownerNode["uid"] = owners[0].uid;

    return ownerNode;
}

async function repoNode(txn, repoName) {
    let repoNode = {
        name: repoName
    }

    let query = `query repos($repoName: string) {
        repos(func: eq(name, $repoName)) @filter(has(org))
        {
            uid
        }
    }`;
    let vars = { $repoName: repoName };
    let res = await txn.queryWithVars(query, vars);
    let repos = res.data.repos;
    if (repos.length > 0) repoNode["uid"] = repos[0].uid;

    return repoNode;
}

async function topicNode(txn, topicName) {
    let topicNode = {
        name: topicName
    }
    let query = `query topics($topicName: string) {
        topics(func: eq(name, $topicName))
        {
            uid
        }
    }`;
    let vars = { $topicName: topicName };
    let res = await txn.queryWithVars(query, vars);
    let topics = res.data.topics;
    if (topics.length > 0) topicNode["uid"] = topics[0].uid;

    return topicNode;
}

async function topicNodes(txn, topicNames) {
	let topicNodes = [];
    if (topicNames && topicNames.length > 0) {
        for (const topicName of topicNames) {
            const topicNodeToAdd = await topicNode(txn, topicName);
            topicNodes.push(topicNodeToAdd);
        }
    }
    return topicNodes;
}

async function relatedRepoNode(txn, inputTextID) {
    const relatedRepoInput = select(inputTextID).value

    if (relatedRepoInput.length === 0) return {};

    const {owner: relatedOwner, repo: relatedRepo} = ownerAndRepo(relatedRepoInput);
    let relatedRepoNode = await repoNode(txn, relatedRepo);
    relatedRepoNode["org"] = await ownerNode(txn, relatedOwner);

    return relatedRepoNode;
}

async function fetchRepoInfoFromApi(owner, repo) {
	const response = await api.v3(`repos/${owner}/${repo}`);
	if (response) return response;
}

async function addRepo(dgraphClient, owner, repo) {
    const txn = dgraphClient.newTxn();
    try {
        
        let addRepoNode = await repoNode(txn, repo);
        addRepoNode["org"] = await ownerNode(txn, owner);
        
        addRepoNode["similar_to"] = await relatedRepoNode(txn, "#similar-to");
        addRepoNode["conjoined_with"] = await relatedRepoNode(txn, "#conjoined-with");
        addRepoNode["built_on"] = await relatedRepoNode(txn, "#built-on");

        const repoInfo = await fetchRepoInfoFromApi(owner, repo);
        addRepoNode["description"] = repoInfo.description;
        addRepoNode["website"] = repoInfo.homepage;        
        addRepoNode["topic"] = await topicNodes(txn, repoInfo.topics);
        
        await txn.mutate({ setJson: addRepoNode });

        await txn.commit();
    } finally {
        await txn.discard();
    }
}

if (select.exists('.btn-add-repo')) {
    select('.btn-add-repo').addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const owner = urlParams.get('owner');
        const repo = urlParams.get('repo');
        const dgraphClientStub = newClientStub();
        const dgraphClient = newClient(dgraphClientStub);

        addRepo(dgraphClient, owner, repo).then(() => {
            console.log("\nDONE!");
            close();
        }).catch((e) => {
            console.log("ERROR: ", e);
            select("#addrepomsgs").innerHTML="";
            select("#addrepomsgs").append(e);
        });

        
    });
}


