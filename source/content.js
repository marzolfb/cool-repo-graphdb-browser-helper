import 'webext-dynamic-content-scripts';
import {h} from 'dom-chef';
import select from 'select-dom';
import domLoaded from 'dom-loaded';

import showAddRepoForm from './features/show-add-repo-form';

import * as pageDetect from './libs/page-detect';
import {safeElementReady, enableFeature, safeOnAjaxedPages, injectCustomCSS} from './libs/utils';

// Add globals for easier debugging
window.select = select;

async function init() {
	await safeElementReady('body');

	if (pageDetect.is500()) {
		return;
	}

	if (pageDetect.is404()) {
		return;
	}
	if (document.body.classList.contains('logged-out')) {
		console.warn('%cCool Repo GraphDB Browser Helper%c only works when you’re logged in to GitHub.', 'font-weight: bold', '');
		return;
	}

	if (select.exists('html.cool-repo-graphdb-browser-helper')) {
		console.warn('Cool Repo GraphDB Browser Helper has been loaded twice. If you didn’t install the developer version, this may be a bug. Please report it to: https://github.com/sindresorhus/cool-repo-graphdb-browser-helper/issues/565');
		return;
	}

	document.documentElement.classList.add('cool-repo-graphdb-browser-helper');

	injectCustomCSS();

	if (pageDetect.isRepo()) {
		safeOnAjaxedPages(async () => {
			// Wait for the tab bar to be loaded
			await safeElementReady('.pagehead + *');
			enableFeature(showAddRepoForm);
			// enableFeature(addMoreDropdown);
			// enableFeature(addReleasesTab);
			// enableFeature(removeProjectsTab);
		});
	}

	await domLoaded;
	onDomReady();
}

async function onDomReady() {
	// Push safeOnAjaxedPages on the next tick so it happens in the correct order
	// (specifically for addOpenAllNotificationsButton)
	await Promise.resolve();

	safeOnAjaxedPages(() => {
		ajaxedPagesHandler();

		// Mark current page as "done"
		// so history.back() won't reapply the same changes
		const ajaxContainer = select('#js-repo-pjax-container,#js-pjax-container');
		if (ajaxContainer) {
			ajaxContainer.append(<has-rgh/>);
		}
	});
}

// eslint-disable-next-line complexity
function ajaxedPagesHandler() {
	if (pageDetect.isRepo()) {
		// enableFeature(hideReadmeHeader);
		// enableFeature(addBranchButtons);
		// enableFeature(addDiffViewWithoutWhitespaceOption);
		// enableFeature(addCILink);
		// enableFeature(sortMilestonesByClosestDueDate); // Needs to be after addMilestoneNavigation
	}

	if (pageDetect.isRepoRoot()) {
		// enableFeature(addToggleFilesButton);
	}
}

init();
