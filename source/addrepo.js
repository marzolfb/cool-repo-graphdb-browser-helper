// document.forms[0].onsubmit = function(e) {
//     e.preventDefault(); // Prevent submission
//     console.log("We made it here!")
//     // var password = document.getElementById('pass').value;
//     // chrome.runtime.getBackgroundPage(function(bgWindow) {
//     //     bgWindow.setPassword(password);
//     //     window.close();     // Close dialog
//     // });
// };


import select from 'select-dom';

function addRepo() {
    console.log("We made it here!");
    close();
}

if (select.exists('.btn-add-repo')) {
    select('.btn-add-repo').addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        console.log("owner: " + urlParams.get('owner'));
        console.log("repo: " + urlParams.get('repo'));
        addRepo();
    });
}


