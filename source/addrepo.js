import select from 'select-dom';

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

async function addRepo(dgraphClient, owner, repo) {
    // Create a new transaction.
    const txn = dgraphClient.newTxn();
    try {
        // Create data.
        const p = {
            name: repo
        };

        // Run mutation.
        const assigned = await txn.mutate({ setJson: p });

        // Commit transaction.
        await txn.commit();

        // Get uid of the outermost object (person named "Alice").
        // Assigned#getUidsMap() returns a map from blank node names to uids.
        // For a json mutation, blank node names "blank-0", "blank-1", ... are used
        // for all the created nodes.
        console.log(`Created repo named '${repo}' with uid =  ${assigned.data.uids["blank-0"]}\n`);

        console.log("All created nodes (map from blank node names to uids):");
        Object.keys(assigned.data.uids).forEach((key) => console.log(`${key} => ${assigned.data.uids[key]}`));
        console.log();
    } finally {
        // Clean up. Calling this after txn.commit() is a no-op
        // and hence safe.
        await txn.discard();
    }
}

if (select.exists('.btn-add-repo')) {
    select('.btn-add-repo').addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const owner = urlParams.get('owner');
        const repo = urlParams.get('repo');
        console.log("owner: " + owner);
        console.log("repo: " + repo);

        const dgraphClientStub = newClientStub();
        const dgraphClient = newClient(dgraphClientStub);

        addRepo(dgraphClient, owner, repo).then(() => {
            console.log("\nDONE!");
            close();
        }).catch((e) => {
            console.log("ERROR: ", e);
            close();
        });

        
    });
}


