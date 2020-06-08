function removeFadeOut(el, speed) {
    var seconds = speed / 1000;
    el.style.transition = "opacity " + seconds + "s ease";

    el.style.opacity = 0;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, speed);
}


// change button text
function change_text(id, text, spinner) {
    var ele = document.getElementById(id)
    ele.innerText = text
    if (spinner) {
        var spin = document.createElement("span")
        spin.setAttribute("class", "spinner-border spinner-border-sm")
        ele.prepend(spin)
    }
}

// used to split id up into chunks for id
function get_ident_from_id(id) {
    const split_id = id.split("-")
    const txt_id = split_id[0] + "-" + split_id[1] + "-" + split_id[2]
    return txt_id
}

//get json from the id
function get_json_from_id(id, text) {
    var id_split = id.split("-")
    return {"reply_id": id_split[0], "post_id": id_split[1], "user_id": id_split[2], "text": text}
}

// check validation of textbox
function check_textbox_validation(element) {
    const button_id = element.id
    const txt_id = get_ident_from_id(button_id)
    const txt_box = document.getElementById(txt_id)

    if (txt_box.value.length < 5) {
        var el = document.createElement("div")
        var span = document.createElement("span")
        txt_box.classList.add("is-invalid")
        span.innerText = "Reply must be longer than 5 characters"
        el.setAttribute("class", "invalid-feedback")
        txt_box.parentNode.insertBefore(el, txt_box.nextSibling)
        el.appendChild(span)

    } else if (txt_box.value.length >= 5) {
        txt_box.classList.remove("is-invalid")
        return "True"
    }
}

// used to update the db via API - re editing reply
function update_db_with_edited_reply(button_ele) {
    if (check_textbox_validation(button_ele)) {
        var txtarea = document.getElementById(get_ident_from_id(button_ele.id))
        change_text(button_ele.id, "Saving", "True")
        post_ajax("/api/posts/reply", get_data_for_reply_api_ajax, txtarea, change_reply_to_text, "POST")
    }
}

// used to update the db via API - re deleting reply
function update_db_delete_reply(button_ele) {

    var divEle = document.getElementById(button_ele.getAttribute("data-reply_id"))
    var delete_button = document.getElementById(button_ele.getAttribute("data-submitting_id"))
    change_text(button_ele.id, "Deleting", "True")
    post_ajax("/api/posts/reply", get_data_for_reply_api_ajax, delete_button, remove_comment, "DELETE")
    change_text(button_ele.id, "Delete")
    removeFadeOut(divEle, 600);
}


// used to get post information for ajax
function get_data_for_like_api_ajax(con_type, inputElement) {

    if (inputElement.className.includes("up")) {
        var direction = "up"
    } else {
        var direction = "down"
    }

    if (con_type == "POST") {
        data = get_json_from_id(inputElement.id, direction)
    } else if (con_type == "DELETE") {
        data = get_json_from_id(inputElement.id, "DELETE")
    }
    return data

}

// used to get replies information for ajax
function get_data_for_reply_api_ajax(con_type, inputElement) {

    if (con_type == "POST") {
        data = get_json_from_id(inputElement.id, inputElement.value)
    } else if (con_type == "DELETE") {
        data = get_json_from_id(inputElement.id, "DELETE")
    }
    return data

}


// change the text to a textbox for editing
function change_text_to_textbox(text_ele, click_func) {

    // split id of the edit button to get the reply_id - post_id
    const split = text_ele.id.split("-")
    //new id
    const id_cons = split[0] + "-" + split[1] + "-" + split[2]
    // get element
    var ele = document.getElementById(id_cons)
    // store text
    const txt = ele.innerText

    var new_btn = document.getElementById(id_cons + "-edit")
    const token = document.getElementById("Usertoken").innerText

    // create new item
    var txtarea = document.createElement("textarea")
    // set text and formatting
    txtarea.value = txt
    txtarea.id = ele.id
    txtarea.className = "form-control form-control-sm mb-2"
    // replace both
    ele.parentNode.replaceChild(txtarea, ele)

    // change button from "Edit" to "Save"
    change_text(new_btn.id, "Update")

    new_btn.onclick = function () {
        update_db_with_edited_reply(new_btn)
    }
}


function change_reply_to_text(ele_name, data) {
    // split id of the edit button to get the reply_id - post_id
    const split = ele_name.split("-")
    // get element
    var txt_reply_element = document.getElementById(split[0] + "-" + split[1] + "-" + split[2])
    // store text
    const txt_value = txt_reply_element.value

    // get button element and retrieve token for api call
    var btn_ele = document.getElementById(split[0] + "-" + split[1] + "-" + split[2] + "-edit")
    const token = document.getElementById("Usertoken").innerText

    // test post the ajax form
    //var response = post_ajax("/api/post/update", token, get_json_from_id(btn_ele.id, txt_value))

    // create new item replacing textbox with P element
    var reply_text_p = document.createElement("p")
    // set text and formatting
    reply_text_p.innerText = txt_value
    reply_text_p.id = txt_reply_element.id
    reply_text_p.className = "article-content ow-break-word"
    // replace both
    txt_reply_element.parentNode.replaceChild(reply_text_p, txt_reply_element)

    // change button from "Edit" to "Save"
    var new_btn = document.getElementById(split[0] + "-" + split[1] + "-" + split[2] + "-" + "edit")
    new_btn.innerText = "Edit"

    // change on click back so element can now be editied again
    new_btn.onclick = function () {
        change_text_to_textbox(new_btn)
        //update_reply(this)
    }
    snack("success", "Your reply has been updated!")
}

function remove_comment(id, data) {
    var ele = document.getElementById(id)
    ele.fadeOut(400)
    snack("success", "Your reply has been deleted!")
}

function update_action(newpath, form_id) {
    document.getElementById(form_id).action = newpath
}

function click_delete(element) {
    var deleteEle = document.getElementById("deleteModalDeleteButton")
    deleteEle.setAttribute("onclick", "update_db_delete_reply(this)")
    deleteEle.setAttribute("data-reply_id", element.id.split("-")[0] + "-reply")
    deleteEle.setAttribute("data-submitting_id", element.id)

}


function change_click_like(current_el) {
    const id = get_ident_from_id(current_el.id)

    if (current_el.id.includes("thumbup")) {
        var up = "True"

    } else {
        var up = "False"
    }

    if (current_el.classList.contains("fas")) {
        current_el.className = current_el.className.replace("fas", "far")
        post_ajax("/api/posts/like", get_data_for_like_api_ajax, current_el, null, "DELETE")

        if (up == "True") {
            var change_val = -1
        } else {
            var change_val = 1
        }
    } else if (current_el.classList.contains("far")) {
        current_el.className = current_el.className.replace("far", "fas")
        post_ajax("/api/posts/like", get_data_for_like_api_ajax, current_el, null, "POST")
        if (up == "True") {
            var change_val = 1
        } else {
            var change_val = -1
        }

    }

    if (up == "True") {
        other_ele = document.getElementById(id + "-thumbdown")
    } else {
        other_ele = document.getElementById(id + "-thumbup")
    }

    if (other_ele.classList.contains("fas")) {
        change_val = change_val * 2
        other_ele.className = other_ele.className.replace("fas", "far")
    }

    var likes_total_ele = document.getElementById(id + "-total_likes")
    var post_likes = parseInt(likes_total_ele.innerText, 10)
    likes_total_ele.innerText = post_likes + change_val

    var items = $('*[data-author="' + id.split("-")[2] + '-author"]')
    for (varr in items) {
        ele = items[varr]
        var txt = ele.innerText
        txt = txt.replace("(", "").replace(")", "")
        ele.innerText = "(" + (parseInt(txt, 10) + change_val) + ")"
    }
}


function get_username_email(con_type, inputElement) {
    var username = document.getElementById("reset-username").value
    var email = document.getElementById("reset-email").value
    return {"username": username, "email": email}
}


function reset_password() {
    post_ajax("/api/users/resetpassword", get_username_email, null, reset_password_response, "POST")
}

function reset_password_response(ele, data) {

    var response = JSON.parse(data)
    console.log(response)
    if (response.email == "OK" & response.username == "OK") {
        $('#resetModal').modal('hide');
        snack("success", "Your password reset email has been sent!")
        return
    }

    var ele_username = document.getElementById("reset-username")

    if (response.email == "Not found") {
        ele_username.classList.add("is-invalid")
    } else if (response.email = "OK") {
        try {
            ele_username.classList.remove("is-invalid")
        } catch (err) {

        }
    }

    // Validate username
    var ele_username = document.getElementById("reset-username")

    if (response.username == "Not found") {

        var already_there = document.getElementById("username-error")
        ele_username.classList.add("is-invalid")

        if (already_there == null) {
            var div = document.createElement("div")
            var span = document.createElement("span")
            span.innerText = "Username address not found"
            div.className = "invalid-feedback"
            div.id = "username-error"
            div.appendChild(span)
            ele_username.parentNode.insertBefore(div, ele_username.nextSibling)
        }
    } else if (response.username = "OK") {
        try {
            ele_username.classList.remove("is-invalid")
        } catch (err) {

        }
    }

    // Validate email
    var ele_email = document.getElementById("reset-email")

    if (response.email == "Not found") {
        var already_there = document.getElementById("email-error")
        ele_email.classList.add("is-invalid")

        if (already_there == null) {
            var div = document.createElement("div")
            var span = document.createElement("span")
            span.innerText = "Email address not found"
            div.className = "invalid-feedback"
            div.id = "email-error"
            div.appendChild(span)
            ele_email.parentNode.insertBefore(div, ele_email.nextSibling)
        }
    } else if (response.email = "OK") {
        try {
            ele_email.classList.remove("is-invalid")
        } catch (err) {

        }
    }
}


// the actual api call
function post_ajax(url, get_data_func, inputElement, complete_func, con_type, upload_bar) {

    try {
        var token = document.getElementById("Usertoken").innerText
    } catch (err) {
        var token
    }
    var data = get_data_func(con_type, inputElement)

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.readyState)
            //console.log("ALL OK")
            //console.log(this.responseText)
            //return this.responseText
            xhttp = "None"
            if (complete_func) {
                if (inputElement) {
                    complete_func(inputElement.id, this.responseText)
                } else {
                    complete_func(null, this.responseText)
                }
            }
        } else {
            console.log(this.readyState)
            //console.log(this.status)
            //console.log(this.statusText)
            //return this.responseText
        }
    };
    if (upload_bar) {
        xhttp.upload.onprogress = function (e) {
            var percentComplete = Math.ceil((e.loaded / e.total) * 100);
            console.log(percentComplete)
            $("#upload_progress").attr("style", "width:" + String(percentComplete) + "%")
            if (percentComplete == 100) {
                $("#upload_progress").fadeOut(3000)
            }
        };
    }


    console.log("open")
    xhttp.open(con_type, url, true)
    console.log("set request")

    xhttp.setRequestHeader("Content-type", "application/json")
    if (token) {
        xhttp.setRequestHeader("Authorization", "Bearer " + token)
    }
    console.log("send")
    xhttp.send(JSON.stringify(data))
    console.log("done")

}


// UPDATE ACCOUNT BITS


function post_ajax_new(url, con_type, data, token, complete_func, error_func, progress) {

    try {
        var token = document.getElementById("Usertoken").innerText
    } catch (err) {
        var token
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //console.log(this.readyState)
            //console.log("ALL OK")
            //console.log(this.responseText)
            //return this.responseText
            xhttp = "None"
            if (complete_func) {
                complete_func(this.responseText)
            }
        } else if (this.readyState == 4 && this.status == 400) {
            if (error_func) {
                error_func(this.responseText)
            }
        } else {
            //console.log(this.readyState)
            //console.log(this.status)
            //console.log(this.statusText)
            //return this.responseText
        }
    };

    if (progress) {
        $("#upload_progress").attr("hidden",false)
        $("#upload_text").innerText = "0% uploaded"
        xhttp.upload.onprogress =
            function (e) {
                var percentComplete = Math.ceil((e.loaded / e.total) * 100);
                $("#upload_progress").attr("style", "width:" + String(percentComplete) + "%")
                $("#upload_text").innerText = String(percentComplete) + "% uploaded"

                if (percentComplete == 100) {
                    $("#upload_progress").fadeOut(3000)
                    $("#upload_progress").attr("hidden",true)
                }
            };
    }

    //console.log("open")
    xhttp.open(con_type, url, true)
    //console.log("set request")

    xhttp.setRequestHeader("Content-type", "application/json")
    if (token) {
        xhttp.setRequestHeader("Authorization", "Bearer " + token)
    }
    //console.log("send")
    xhttp.send(JSON.stringify(data))
    //console.log("done")

}


///////////////////////
/// change image    ///
/// change image    ///
/// change image    ///
/// change image    ///
///////////////////////

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

let show_cropper = (file_input) => {
    getBase64(file_input.files[0]).then(
        data => {
            $("#cropImage").attr("src", data)
            $('#image_modal').modal('show')
        })
}

function crop_and_upload_image(){
    //get image
    $('#profile-image').attr("src", cropper.getCroppedCanvas().toDataURL())
    //remove cropper
    cropper.destroy()
    //get data
    data = {"img": $("#cropImage").attr("src")}
    //post data
    post_ajax_new('/api/users/accountimageupdate',
        "POST",
        data,
        null,
        () => snack("success", "Image uploaded"),
        () => {
            snack("danger", "Image upload failed. Please try again");
            $("#upload_progress").hidden;
        },
        true)
}




///////////////////
/// AJAX AJAX  ////
/// AJAX AJAX  ////
/// AJAX AJAX  ////
/// AJAX AJAX  ////
///////////////////




///////////////////////
/// update password ///
/// update password ///
/// update password ///
/// update password ///
///////////////////////

function update_password() {
    if (change_pass_btn == null) {
        change_pass_btn = new Button_ob("change_pass_button")
    }
    change_pass_btn.disable()
    change_pass_btn.set_to_saving("Saving")

    if (password_form_check() == true) {
        var old_password = document.getElementById("old_password")
        var new_password = document.getElementById("new_password")
        var repeat_new_password = document.getElementById("repeat_new_password")
        data = {
            "old_password": old_password.value,
            "new_password": new_password.value,
            "repeat_new_password": repeat_new_password.value
        }
        post_ajax_new("/api/users/updatepassword", "POST", data, null, password_ok, password_not_ok)
    } else {
        change_pass_btn.disable()
        change_pass_btn.set_to_save_complete("Change Password")
        snack("warning", "Password error, please fix before continuing")
    }
}

function password_form_check() {
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    if (mediumRegex.test(new_password.value) & repeat_new_password.value == new_password.value) {
        password_form.get_form("repeat_new_password").clear_feedback_text()
        password_form.get_form("repeat_new_password").add_valid_feedback("")
        password_form.get_form("new_password").clear_feedback_text()
        password_form.get_form("new_password").add_valid_feedback("")
        change_pass_btn.enable()
        return true
    } else {
        password_form.get_form("repeat_new_password").add_invalid_feedback("")
        password_form.get_form("new_password").add_invalid_feedback("Passwords do not match or do not meet requirements")
        change_pass_btn.disable()
        return false
    }
}

function password_ok() {
    change_pass_btn.disable()
    change_pass_btn.set_to_save_complete("Change Password")
    password_form.clear_all_fields_and_formatting()
    $('#reset_password_modal').modal('hide');
    snack("success", "Your password has been updated")
}

function password_not_ok(data) {
    password_form.update_form_with_data(data)
    change_pass_btn.set_to_save_complete("Change Password", false)
    snack("warning", "Your password has been not been updated")
}


///////////////////////////
// check available email //
// check available email //
///////////////////////////

function check_email(element) {
    var data = {"email": element.value}
    post_ajax_new("/api/users/usernames", "POST", data, null, email_ok, email_ok)
    save_account_btn.check_enable(account_form)
}

function email_ok(data) {
    var email_input = document.getElementById("email")
    account_form.update_form_with_data(data, true)
}

//////////////////////////////
// check available username //
// check available username //
//////////////////////////////

function check_username(element) {
    var data = {"username": element.value}
    post_ajax_new("/api/users/usernames", "POST", data, null, username_ok, username_ok)
    save_account_btn.check_enable(account_form)
}

function username_ok(data) {
    var username_input = document.getElementById("username")
    account_form.update_form_with_data(data, true)
}



/////////////////////////
// update account AJAX //
// update account AJAX //
/////////////////////////

function save_account_details(click_element) {
    save_account_btn.disable()
    save_account_btn.set_to_saving("Saving")
    var data = get_account_details()
    var token = click_element.getAttribute("Usertoken")
    post_ajax_new("/api/users/accountupdate", "POST", data, token, completed_save_account_details, error_save_account_details)
}

function completed_save_account_details(data) {
    if (data.includes("Success")) {
        snack("success", 'Your account has been updated!')
        save_account_btn.set_to_save_complete(null, true)
        document.getElementById("account-heading").innerText = document.getElementById("username").value
        document.getElementById("account-email").innerText = document.getElementById("email").value
        account_form.clear_all_formatting()
        save_account_btn.disable()
    }

}

function error_save_account_details(data) {
    account_form.update_form_with_data(data, true)
    save_account_btn.set_to_save_complete(null, true)
}

//get data for ajax post
function get_account_details() {
    username = document.getElementById("username").value
    name = document.getElementById("name").value
    slogan = document.getElementById("slogan").value
    email = document.getElementById("email").value
    var img = document.getElementById("profile-image")
    profile = {
        "base64": img.src,
    }

    return {"username": username, "name": name, "slogan": slogan, "email": email, "image": profile}
}


///////////////
// Snack bar //
// Snack bar //
// Snack bar //
// Snack bar //
// Snack bar //
///////////////

function snack(alert_type, text) {

    if (alert_type == "primay") {
        var col = "#cce5ff"
        var txt = "#004085"
    } else if (alert_type == "secondary") {
        var col = "#e2e3e5"
        var txt = "#383d41"
    } else if (alert_type == "success") {
        var col = "#d4edda"
        var txt = "#155724"
    } else if (alert_type == "danger") {
        var col = "#f8d7da"
        var txt = "#721c24"
    } else if (alert_type == "warning") {
        var col = "#fff3cd"
        var txt = "#856404"
    }
    Snackbar.show({
        text: text,
        backgroundColor: col,
        duration: 5000,
        textColor: txt,
        actionTextColor: txt
    })
}


///////////////////
// button object //
// button object //
// button object //
///////////////////

function Button_ob(button_id, start_disabled) {
    this.element = document.getElementById(button_id)
    this.button_text = this.element.getElementsByTagName("span")[0]
    this.init_text = this.button_text.innerText
    this.button_loading = this.element.getElementsByTagName("span")[1]
    this.click_action = this.element.onclick

    this.is_enabled = function () {
        if (this.element.classList.contains("hidden")) {
            return false
        } else {
            return true
        }
    }
    this.disable = function () {
        if (this.element.classList.contains("disabled") == false) {
            this.element.classList.add("disabled")
            this.element.onclick = ""
        }
    }
    this.enable = function () {
        if (this.element.classList.contains("disabled")) {
            this.element.classList.remove("disabled")
            this.element.onclick = this.click_action
        }
    }
    this.set_to_saving = function (save_text) {
        this.button_text.innerText = save_text
        this.button_loading.hidden = false
        this.disable()
    }
    this.set_to_save_complete = function (save_text, enable) {
        this.button_loading.hidden = true
        if (save_text) {
            this.button_text.innerText = save_text
        } else {
            this.button_text.innerText = this.init_text
        }
        if (enable == true) {
            this.enable()
        }
    }
    this.check_enable = (form) => {
        for(form_f in form.forms){
            if(form.forms[form_f].form_field.classList.contains("is-invalid")){
                this.disable()
                return
            }
            this.enable()
        }
    }
    if (start_disabled) {
        this.disable()
    }
}


///////////////////
// forms  object //
// forms  object //
// forms  object //
///////////////////

function forms(forms_list) {

    this.forms = forms_list

    this.clear_all_formatting = function () {
        for (var form_f in this.forms) {
            this.forms[form_f].clear_feedback()
        }
    }

    this.clear_all_fields_and_formatting = function () {
        for (var form_f in this.forms) {
            this.forms[form_f].clear_field()
            this.forms[form_f].clear_feedback()
        }
    }

    this.update_form_with_data = function (data, show_on_ok) {
        data = JSON.parse(data)
        for (const data_item in data) {
            for (const form_f in this.forms) {
                var form_field = this.forms[form_f]
                if (form_field.id == data_item) {
                    if (data[data_item] == "ok") {
                        form_field.clear_feedback()
                        if (show_on_ok == true) {
                            form_field.add_valid_feedback()
                        }
                    } else {
                        form_field.clear_feedback()
                        form_field.add_invalid_feedback(data[data_item])
                    }
                }
            }
        }
    }
    this.get_form = function (form_name) {
        for (var form_f in this.forms) {
            if (this.forms[form_f].name == form_name) {
                return this.forms[form_f]
            }
        }
    }
}


///////////////////
// forms  object //
// forms  object //
// forms  object //
///////////////////

function form_field(item_name, id, default_valid, default_invalid) {
    this.name = item_name
    this.id = id
    this.form_field = document.getElementById(id)

    //create invalid if needed
    if (this.form_field.parentElement.getElementsByClassName("invalid-feedback").length == 0) {
        var div_inv = document.createElement("div")
        div_inv.className = "invalid-feedback"
        this.form_field.parentElement.insertBefore(div_inv, this.form_field.nextSibling)
        this.invalid_field = div_inv
    } else {
        this.invalid_field = this.form_field.parentElement.getElementsByClassName("invalid-feedback")[0]
    }
    //set default if needed
    if (default_invalid) {
        this.invalid_field.innerText = default_invalid
    }

    //create valid if needed
    if (this.form_field.parentElement.getElementsByClassName("valid-feedback").length == 0) {
        var div_v = document.createElement("div")
        div_v.className = "valid-feedback"
        this.form_field.parentElement.insertBefore(div_v, this.form_field.nextSibling)
        this.valid_field = div_v
    } else {
        this.valid_field = this.form_field.parentElement.getElementsByClassName("valid-feedback")[0]
    }
    //set default if needed
    if (default_valid) {
        this.valid_field.innerText = default_valid
    }

    this.clear_feedback = function () {
        if (this.form_field.classList.contains("is-invalid")) {
            this.form_field.classList.remove("is-invalid")
        }
        if (this.form_field.classList.contains("is-valid")) {
            this.form_field.classList.remove("is-valid")
        }
    }

    this.clear_feedback_text = function () {
        this.invalid_field.innerText = ""
        this.valid_field.innerText = ""
    }

    this.clear_field = function () {
        this.form_field.value = ""
    }

    this.add_invalid_feedback = function (text) {
        this.clear_feedback()
        this.form_field.classList.add("is-invalid")
        if (text) {
            this.invalid_field.innerText = text
        }
    }

    this.add_valid_feedback = function (text) {
        this.clear_feedback()
        this.form_field.classList.add("is-valid")
        if (text) {
            this.valid_field.innerText = text
        }
    }
}

