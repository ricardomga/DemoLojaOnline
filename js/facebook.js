
var appId = "1557527997889365";
var pageAccessToken;
var pageId = document.getElementById("page").value;
var lstPages;

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {

    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        logginMessage();
        lstUserPages();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Necessita de aceitar os termos da aplicação!';
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.

        document.getElementById('status').innerHTML = 'Necessita de entrar no facebook!';
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    }, true);
}

function deleteLoginMessage() {
    document.getElementById('status').innerHTML = "";
    checkLoginState();
}

function lstUserPages() {
    FB.api(
        "me/?fields=accounts",
        function (response) {
            if (response && !response.error) {
                console.log(response);
                //Verificar se o utilizador tem contas
                if (response.accounts.data.length != 0) {
                    lstPages = response.accounts.data;
                    var select = document.getElementById("page");
                    console.log(lstPages.length);
                    for (i = 0; i < lstPages.length; i++) {
                        var opt = document.createElement("option");
                        opt.value = lstPages[i].id;
                        opt.innerHTML = lstPages[i].name;
                        select.appendChild(opt);
                    }
                    setAccessToken();
                } else {
                    messageAlert("Necessita de criar uma página!", "info");
                }
            } else {
                messageAlert("Erro ao acessar ás páginas que gere!", "danger");
            }
        });
}

function setAccessToken() {
    pageId = document.getElementById("page").value;
    var page;
    for (i = 0; i < lstPages.length; i++) {
        page = lstPages[i];
        if (pageId == page.id) {
            pageAccessToken = page.access_token;
        }
    }
}

function createTab() {
    var tabName = document.getElementById("tabName").value;
    //FB.ui({
    //    method: 'pagetab',
    //    redirect_uri: 'https://socialbs.azurewebsites.net/store/'
    //}, function (response) {
    //    alert("tab criada com sucesso");
    //});
    FB.api(
        "/" + pageId + "/tabs", "post",
        { access_token: pageAccessToken, app_id: appId, position:2, custom_name: tabName },
        function (response) {
            if (response && !response.error) {
                messageAlert("Separador criado com sucesso", "success");
            }
            console.log(response);
        });
}

function deleteTabs() {
    FB.api(
        "/" + pageId + "/tabs", "delete",
        { access_token: pageAccessToken, tab: "app_" + appId },
        function (response) {
            if (response && !response.error) {
                messageAlert("Separador eleminado com sucesso", "success");
            } else {
                messageAlert("Não foi possivel elminar o Separador", "danger");
            }
            
        });
}


window.fbAsyncInit = function () {
    FB.init({
        appId: appId,
        cookie: true,  // enable cookies to allow the server to access the session
        xfbml: true,  // parse social plugins on this page
        version: 'v2.5' // use graph api version 2.5
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    checkLoginState();

};

// Load the SDK asynchronously
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.

function messageAlert(message, type) {
    $('#messages').removeClass('hide').addClass('alert alert-'+ type +' alert-dismissible').slideDown().show();
    $('#messages_content').html('<h4>' + message + '</h4>');
    $('#messages').fadeOut(5000);
   
}


function logginMessage() {
    FB.api('/me',
        function (response) {
            document.getElementById('status').innerHTML = 'Está logado com a conta, ' + response.name + '!';
        });
}
