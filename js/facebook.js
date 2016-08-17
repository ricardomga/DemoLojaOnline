
// facebook aplication Id
var appId = "1557527997889365";

// acess token for the facebook page that is selected
var pageAccessToken;

// facebook page id of the selected page
var pageId = $("#page").val();

//list of facebook pages manged by the user
var fbPages = [];

window.fbAsyncInit = function () {
    FB.init({
        appId: appId,
        cookie: true,  // enable cookies to allow the server to access the session
        xfbml: true,  // parse social plugins on this page
        version: 'v2.5' // use graph api version 2.5
    });

    // Now that we've initialized the JavaScript SDK, we call
    // checkLoginState().  This function will trigger the FB.getLoginStatus that 
    //gets the state of the business suite user visiting this page and can return 
    //one of three states to the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    checkLoginState();

};


// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
}


// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    // The response object is returned with a status field that lets the
    // app know the current login status of the business suite user.
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        logginMessage();
        getFbPagesManagedByUser();
    } else if (response.status === 'not_authorized') {
        // The busineess suite user is logged into Facebook, but not your app.
        $('#status').text('Necessita de aceitar os termos da aplicação!');
    } else {
        // The busineess suite user is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        $('#status').text('Necessita de entrar no facebook!');
    }
}

//this function shows to the user a message indication wich facebook account he is logged in
function logginMessage() {
    FB.api('/me',
        function (response) {
            $('#status').text('Está logado com a conta, ' + response.name + '!');
        });
}


//this function will get the facebook pages that the user manages 
//and put them in a drop down list, so the user choose the page he
//wants to add the Facebook tab
function getFbPagesManagedByUser() {
    FB.api("me/?fields=accounts", loadFbPages);
}


function loadFbPages(response) {
    if (response && !response.error) {
        //Checks if the facebook user manages any page, if he doens't manges 
        //any page is showed a message to the user and the function stops 
        if (response.accounts.data.length == 0) {
            messageAlert("Necessita de gerir pelo menos uma página!", "info");
            return;
        }

        //put the retrived fb pages in a the global variavel fbPages
        fbPages = response.accounts.data;
        var select = $("#page");
        for (i = 0; i < fbPages.length; i++) {
            //create a new option for each page and puts the fb page id in the option value
            select.append($("<option></option>").val(fbPages[i].id).text(fbPages[i].name));
        }

        //after all pages are loaded in the drop down list we set the
        //access token of the page that is selected by default  
        setAccessToken();
    } else {
        //error message if the response is not the expected
        messageAlert("Erro ao acessar as páginas que gere!", "danger");
    }
}


//this function set the access token of the current selected page in the drop down list
function setAccessToken() {
    //gets the selected fb page id and put it in the global variavel pageId
    pageId = $("#page").val();
    //iterates the global variavel fbPages array
    for (i = 0; i < fbPages.length; i++) {
        //when the ids match it takes the fb page access token and put it 
        //in the global variavel pageAccessToken for future fb requests
        if (pageId == fbPages[i].id) {
            pageAccessToken = fbPages[i].access_token;
            return;
        }
    }
}


//this function creates a facebook page tab in the acount that is
//selected in the drop down list
function createTab() {
    var tabName = $("#tabName").val();
    FB.api("/" + pageId + "/tabs",
        "post",
        {
            access_token: pageAccessToken,
            app_id: appId,
            position: 2,
            custom_name: tabName
        },
        onCreateTabResponse);
}


//this function cheks for errors, if there are no errors it will call the function resgisterBSUser();
function onCreateTabResponse(response) {
    if (response && !response.error) {
        registerBSUser();
    } else {
        messageAlert("Não foi possivel criar o separador no facebook!", "danger");
        console.log("Error onCreateTabResponse: " + response);
    }

}


//this function will call the web api Primavera.eComerse.API that will record the Facebook page id, 
//the user name and password, tenent id, organization id of the Business Suite User. 
//This is done for mapping the facebook requests int the future
function registerBSUser() {
    var request = $.post($('input[name=env]:checked', '#form').val(),
        {
            // this fields mut be load dinamicaly from the BS context
            RowKey: pageId,
            UserName: $("#bsUsername").val(),
            Password: $("#bsPass").val(),
            TenentId: $("#tenentId").val(),
            OrganizationId: $("#orgId").val()
        },
        onRegisterBSUserSuccess,
        "json"
    ).fail(onRegisterBSUserFail);
}

function onRegisterBSUserSuccess(data, textStatus) {
    messageAlert("Separador criado com sucesso", "success");
    console.log("register bs user status: ", textStatus);
}

//this function will delete the created tab and send 
//a error message to the user because the errors ocurred during 
//the registerBSUser();
function onRegisterBSUserFail(error, status) {
    FB.api("/" + pageId + "/tabs",
        "delete",
        {
            access_token: pageAccessToken,
            tab: "app_" + appId
        });
    messageAlert("Ocorreram erros durante este processo", "danger")
    console.log(error);
}


//deletes the fb page tab selected in the drop down list
function deleteTabs() {
    FB.api("/" + pageId + "/tabs",
        "delete",
        {
            access_token: pageAccessToken,
            tab: "app_" + appId
        },
        function (response) {
            if (response && !response.error) {
                messageAlert("apagado com sucesso", "success");
            } else {
                console.log(response);
            }
        });
}




//this function recives a message and a type and based on that shows a 
//success message, error message or info message
function messageAlert(message, type) {
    $('#messages').removeClass('hide').addClass('alert alert-' + type
        + ' alert-dismissible').slideDown().show();
    $('#messages_content').html('<h4>' + message + '</h4>');
    $('#messages').fadeOut(5000);

}


// Load the facebook SDK asynchronously
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


// ------------------------Mocks-----------------------------
var User = function (username, password, tenentId, organizationId) {
    this.username = username;
    this.password = password;
    this.tenentId = tenentId;
    this.organizationId = organizationId;
}

var users = [];

users["gomes@esposende2000.pt"] = new User("gomes@esposende2000.pt", "1029384756", "89714", "89714-BusinessSuite");
users["geral@2solutions.pt"] = new User("geral@2solutions.pt", "1029384756", "66767", "66767-BusinessSuite");

function updateBSInfo() {
    var username = $("#bsUsername").val();
    $("#bsPass").val(users[username].password);
    $("#tenentId").val(users[username].tenentId);
    $("#orgId").val(users[username].organizationId);
}

$("#bsUsername").change(updateBSInfo);

$(document).ready(updateBSInfo);