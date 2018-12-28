import select from 'select-dom';
import {h} from 'dom-chef';
import {appendBefore} from '../libs/utils';
import {getOwnerAndRepo} from '../libs/page-detect';


function showAddRepoForm() {
	let ownerAndRepo = getOwnerAndRepo();
	chrome.runtime.sendMessage({
		type:'addRepo',
		owner: ownerAndRepo.ownerName,
		repo: ownerAndRepo.repoName
	});
}

function createButton() {
	appendBefore('.pagehead h1', '.fork-flag',
		<button type="button" class="btn.addrepoform btn btn-sm empty-icon" onClick={showAddRepoForm}>
			{'Add to GraphDB'}
		</button>
	);
}

export default async function () {
	if (!select.exists('.btn.addrepoform')) {
		createButton();
	}
}
