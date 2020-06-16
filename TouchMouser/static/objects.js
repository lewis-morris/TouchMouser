/// used to log mouse and keyboard sends to the server
//
function Log() {
    this.keymouse_speed = []
    this.mouse_trans = 0
    this.mouse_errors = 0
    this.key_trans = 0
    this.key_errors = 0

    this.log_trans = (typ, complete_type) => {
        if (typ == "mouse" & complete_type == true) {
            this.mouse_trans = this.mouse_trans + 1
            document.getElementById("mouse_complete").innerText = this.mouse_trans
        } else if (typ == "mouse" & complete_type == false) {
            this.mouse_errors = this.mouse_errors + 1
            document.getElementById("mouse_error").innerText = this.mouse_errors
        } else if (typ == "keyboard" & complete_type == true) {
            this.key_trans = this.key_trans + 1
            document.getElementById("keyboard_complete").innerText = this.key_trans
        } else if (typ == "keyboard" & complete_type == false) {
            this.key_errors = this.key_errors + 1
            document.getElementById("keyboard_error").innerText = this.key_errors
        }

    }
    this.log_start = () => {
        this.time_start = new Date()
    }
    this.log_end = () => {
        let dte = new Date()
        let time_taken = dte - this.time_start
        if (this.keymouse_speed.length > 20) {
            this.keymouse_speed.shift()
        }
        this.keymouse_speed.push(time_taken)
        this.get_keymouse_speed()
    }
    this.get_keymouse_speed = () => {
        let sum = this.keymouse_speed.reduce((previous, current) => current += previous)

        document.getElementById("transfer_speed").innerText = Math.round(sum / this.keymouse_speed.length, 2)
    }

}

//// Settings object used to store, set and amend pagewide settings. Stores in cookies for retrieval on page load etc
function Settings() {

    this.return_bool = (val) => {
        val = val.toString()
        return val == "true"
    }

    this.set_settings = () => {
        this.dynamic_multiplier_ele.checked = this.return_bool(this.dynamic_multiplier)
        this.accept_touch_ele.checked = this.return_bool(this.accept_touch)
        this.touch_send_ms_ele.value = this.touch_send_ms
        this.movement_multiplier_ele.value = this.movement_multiplier
    }

    this.set_defaults = () => {
        this.dynamic_multiplier = true
        this.movement_multiplier = 15
        this.touch_send_ms = 60
        this.accept_touch = true
        this.set_settings()
    }

    this.change_setting = (obj) => {
        if (obj.getAttribute("type") == "text") {
            document.cookie = String(obj.id) + "=" + obj.value + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
        } else {
            document.cookie = String(obj.id) + "=" + obj.checked + "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
        }

    }
    this.multiply_mouse_speed = (x_diff, y_diff) => {

        const movement_mul = parseInt(this.movement_multiplier)

        if (this.dynamic_multiplier) {
            let x_perc = (Math.abs(x_diff) / 12)
            let y_perc = (Math.abs(y_diff) / 12)
            var x_send = (x_diff * -1) * (movement_mul * x_perc)
            var y_send = (y_diff * -1) * (movement_mul * y_perc)
        } else {
            var x_send = (x_diff * -1) * (movement_mul)
            var y_send = (y_diff * -1) * (movement_mul)
        }

        return [x_send, y_send]
    }


    // set boxes elements ets

    //reset button
    this.reset_options_btn = document.getElementById("reset_options")
    this.reset_options_btn.onclick = () => {
        this.set_defaults()
    }


    //dynamic multiplier checkbox
    this.dynamic_multiplier_ele = document.getElementById("dynamic_multiplier")
    this.dynamic_multiplier_ele.onchange = () => {
        this.change_setting(this.dynamic_multiplier_ele)
        this.dynamic_multiplier = this.dynamic_multiplier_ele.checked
    }
    if (getCookie("dynamic_multiplier")) {
        this.dynamic_multiplier = getCookie("dynamic_multiplier")
        this.dynamic_multiplier_ele.checked = this.return_bool(this.dynamic_multiplier)
    } else {
        this.dynamic_multiplier = true
    }


    // set accept touch
    this.accept_touch_ele = document.getElementById("accept_touch")
    this.accept_touch_ele.onchange = () => {
        this.change_setting(this.accept_touch_ele)
        this.accept_touch = this.accept_touch_ele.checked
    }
    if (getCookie("accept_touch")) {
        this.accept_touch = getCookie("accept_touch")
        this.accept_touch_ele.checked = this.return_bool(this.accept_touch)
    } else {
        this.accept_touch = true
    }

    //set touch sec ms text field
    this.touch_send_ms_ele = document.getElementById("touch_send_ms")
    this.touch_send_ms_ele.onchange = () => {
        this.change_setting(this.touch_send_ms_ele)
        this.touch_send_ms = this.touch_send_ms_ele.value
    }
    if (getCookie("touch_send_ms")) {
        this.touch_send_ms = getCookie("touch_send_ms")
        this.touch_send_ms_ele.value = this.touch_send_ms
    } else {
        this.touch_send_ms = 60
    }

    // set movement multiplier field
    this.movement_multiplier_ele = document.getElementById("movement_multiplier")
    this.movement_multiplier_ele.onchange = () => {
        this.change_setting(this.movement_multiplier_ele)
        this.movement_multiplier = this.movement_multiplier_ele.value
    }
    if (getCookie("movement_multiplier")) {
        this.movement_multiplier = getCookie("movement_multiplier")
        this.movement_multiplier_ele.value = this.movement_multiplier
    } else {
        this.movement_multiplier = 15
    }


    this.set_settings()
}


// Application List - used to control bulk aspects of each application and to facilitate searching

function ApplicationList() {
    this.app_list = []
    this.loading_ele = document.getElementById("app_loading")
    this.refresh_button = document.getElementById("app_refresh_button")
    this.show_running_button = document.getElementById("app_show_running")
    this.app_refresh_running_button = document.getElementById("app_refresh_running_button")
    this.search_box = document.getElementById("app_seach_box")
    this.drop_down = document.getElementById("app_dropdown")
    this.search_area = document.getElementById("application_search_section")


    this.load = () => {
        post_ajax_new("/api/returnprogram", "get", null, null, (data) => {
            let new_data = JSON.parse(data)
            for (x in new_data) {
                this.app_list.push(new Application(new_data[x]))

            }
            this.load_categories()
            this.done_loading(true)
        }, null, null)
    }

    this.set_loading = (search) => {
        this.loading_ele.hidden = false
        this.show_running_button.hidden = true
        this.refresh_button.hidden = true
        this.app_refresh_running_button.hidden = true
        if (search) {
            this.search_area.hidden = true
        }
    }

    this.done_loading = (search) => {
        this.loading_ele.hidden = true
        this.refresh_button.hidden = false
        this.app_refresh_running_button.hidden = false
        if (search) {
            this.search_area.hidden = false
        }
        this.show_running_button.hidden = false

    }
    this.load_categories = () => {
        // load categories and create
        let el = document.getElementById("search_op")
        this.categories = []
        for (const app in this.app_list) {
            for (const cat in this.app_list[app].categories) {
                let cat_ = this.app_list[app].categories[cat]
                if (this.categories.includes(cat_) == false) {
                    this.categories.push(cat_)
                }
            }
        }
        this.categories.sort()
        for (const categ in this.categories) {
            const cate = this.categories[categ]
            if (cate != "") {
                let new_op = el.cloneNode(true)
                new_op.value = cate
                new_op.innerText = cate
                new_op.hidden = false
                el.parentElement.appendChild(new_op, el.nextSibling)
            }
        }
    }

    this.show_all = () => {
        for (const app in this.app_list) {
            this.app_list[app].show()
        }
    }
    this.hide_all = () => {
        for (const app in this.app_list) {
            this.app_list[app].hide()
        }
    }
    this.update_all_pid = () => {
        this.set_loading()
        for (const appl in this.app_list) {
            this.app_list[appl].update_pid()
        }
        this.done_loading()
    }

    this.refresh_button.onclick = () => {

        this.set_loading(true)
        for (const ap in this.app_list) {
            this.app_list[ap].element.parentNode.remove(this.app_list[ap].element)
        }

        this.app_list = []
        this.load()

    }

    this.show_all_pid = () => {
        this.set_loading()
        for (const appl in this.app_list) {
            if (this.app_list[appl].close_button.innerText == "Kill") {
                this.app_list[appl].show()
            } else {
                this.app_list[appl].hide()
            }
        }
        this.done_loading()
    }

    this.show_running_button.onclick = () => {
        this.show_all_pid()
    }
    this.app_refresh_running_button.onclick = this.update_all_pid


    this.search_cat_change = () => {
        if (this.drop_down.value == "All Categories") {
            if (this.search_box.value == "") {
                // horrible way to stop 0 length results for all cat
                var cat = "zzzzzz"
            } else {
                var cat = ""
            }
        } else {
            var cat = this.drop_down.value
        }
        for (appl in this.app_list) {
            if (this.app_list[appl].name.toLocaleLowerCase().includes(this.search_box.value.toLocaleLowerCase()) & this.app_list[appl].categories.includes(cat)) {
                this.app_list[appl].show()
            } else {
                this.app_list[appl].hide()
            }
        }
    }

    this.drop_down.onchange = this.search_cat_change
    this.search_box.onkeyup = this.search_cat_change

    this.set_loading(true)
    this.load()


}


// Application object, handles the running and closing of applications.

function Application(arr) {

    // create visible element
    this.create_element = () => {
        let app = document.getElementById("application-base")
        this.element = app.cloneNode(true)
        app.parentElement.appendChild(this.element, app.nextSibling)
        this.created = true

        this.open_button = this.element.querySelector("button[data-app-open]")

        this.close_button = this.element.querySelector("button[data-app-close]")
        this.show_button = this.element.querySelector("button[data-app-show]")
        this.hide_button = this.element.querySelector("button[data-app-hide]")

        this.name_ele = this.element.querySelector("div[data-app-name]")
        this.show_ele = this.element.querySelector("img[data-app-image]")


        this.window_house = this.element.querySelector("div[data-app-window-houser]")
        this.windows_block = this.element.querySelector("div[data-app-window-col]")
        this.window_item = this.element.querySelectorAll("div[data-app-window-item]")[0]
        this.window_toggle = this.element.querySelector("a[data-window-toggle]")
        this.window_toggle.hidden = true

        this.windows = this.element.querySelector("img[data-app-image]")

        this.image_ele = this.element.querySelector("img[data-app-image]")
        this.update_pid()
    }

    // hide for searching
    this.hide = () => {
        this.element.hidden = true
    }

    // show for seaching
    this.show = () => {
        this.element.hidden = false
    }

    // run the program
    this.run = () => {
        post_ajax_new("/api/loadprogram", "post", JSON.stringify({"ex": this.exe}), null, (data) => {
            this.update_pid()
        }, () => {
            snack("warning", "App run failed")
        }, null)
    }

    // show all windows on screen
    this.show_windows = (ty) => {
        post_ajax_new("/api/showpid", "post", JSON.stringify({"pid": this.pid, "type": ty}), null, (data) => {
            console.log("")
        }, () => {
            snack("warning", "Window show failed")
        }, null)
    }

    //update running or not
    this.update_pid = () => {

        post_ajax_new("/api/getpids", "post", JSON.stringify({
            "proc": this.proc_name,
            "proc_one": this.proc_name_one,
            "proc_two": this.proc_name_two,
            "proc_three": this.proc_name_three
        }), null, (data) => {
            let data_new = JSON.parse(data)
            if (data_new.pid.length > 1) {
                this.pid = data_new.pid
                if (data_new.windows) {
                    this.show_windows_list(data_new.windows)
                } else {
                    this.hide_windows()
                }
                this.enable_kill_button()
            } else {
                this.disable_kill_button()
            }

            // if has windows then show windows


            return data_new.pid
        }, () => {
            snack("warning", "PID retrieve failed")
        }, null)
    }

    // remove all windows if applicable
    this.remove_all = () => {
        if (this.window_list) {
            for (const win in this.window_list) {
                this.window_list[win].remove()
            }
        }
        this.window_list = []
        this.window_toggle.hidden = true
    }

    //add the windows drop down
    this.show_windows_list = (win_list) => {
        this.window_toggle.hidden = false
        this.windows_block.hidden = false
        var name = this.unique_name + "wincol"
        name = name.replace(" ", "_")
        this.window_toggle.setAttribute("data-target", "#" + name)
        this.windows_block.id = name

        this.remove_all()
        this.window_toggle.hidden = false

        for (const pid in win_list) {
            for (const win in win_list[pid]) {
                if (win != "") {
                    this.window_list.push(new Window(this.window_item, win_list[pid][win]))
                }
            }
        }
        this.window_item.hidden = true

        //this.show()

    }

    // hide the windows section
    this.hide_windows = () => {
        this.window_toggle.hidden = true
        this.windows_block.hidden = true
        //this.show()

    }

    // kill process
    this.kill = () => {
        post_ajax_new("/api/killpid", "post", JSON.stringify({
            "proc": this.proc_name,
            "proc_one": this.proc_name_one,
            "proc_two": this.proc_name_two,
            "proc_three": this.proc_name_three
        }), null, (data) => {
            let data_new = JSON.parse(data)
            this.disable_kill_button()
            this.remove_all()
        }, () => {
            snack("warning", "App kill failed")
        }, null)
    }

    // used to enable the kill button and will allow show/hide if a window is found for associated PID
    this.enable_kill_button = () => {

        this.close_button.classList.remove("disabled")


        if (this.window_list.length > 0) {
            this.show_button.hidden = false
            this.hide_button.hidden = false
        } else {
            this.show_button.hidden = true
            this.hide_button.hidden = true
        }

        this.close_button.innerText = "Kill"
        this.close_button.onclick = () => {
            this.kill()
        }
    }

    //used to disable the kill button
    this.disable_kill_button = () => {
        if (this.close_button.classList.contains("disabled") == false) {
            this.close_button.classList.add("disabled")
            this.close_button.onclick = ""
            this.close_button.innerText = "Closed"
            this.close_button.onclick = null
        }
        this.show_button.hidden = true
        this.hide_button.hidden = true
    }

    this.window_list = []
    this.name = arr.app_name
    this.unique_name = this.name + "-" + String(Math.round(Math.random() * 100, 0))
    this.exe = arr.cmd
    this.categories = arr.categories.split(";")
    this.pid = arr.pid
    this.image = arr.icons
    this.proc_name = arr.procname
    this.proc_name_one = arr.alt_procname
    this.proc_name_two = arr.alt2_procname
    this.proc_name_three = arr.alt3_procname

    //create visible element
    this.create_element()

    // fix svg if applicable
    this.image_ele.setAttribute("src", this.image.replace("svg", "svg+xml"))
    //set name
    this.name_ele.innerText = this.name


    //set on click of open button
    this.open_button.onclick = () => {
        this.run()
    }
    this.show_button.onclick = () => {
        if (this.pid) {
            this.show_windows("max")
        }
    }
    this.hide_button.onclick = () => {
        if (this.pid) {
            this.show_windows("min")
        }
    }


    // allow close or not
    if (this.pid) {
        this.enable_kill_button()

    } else {
        this.disable_kill_button()
    }

    //hide initially ready for searching
    this.hide()

}

function Window(parent, data) {

    this.name = data.name
    this.pid = data.pid
    this.hex = data.winhex

    this.create = (parent) => {

        this.element = parent.cloneNode(true)
        parent.parentElement.appendChild(this.element, parent.nextSibling)
        this.element.nextSibling
        this.name_ele = this.element.querySelector("div[data-app-window-name]")
        this.pid_ele = this.element.querySelector("div[data-app-window-pid]")
        this.hex_ele = this.element.querySelector("div[data-app-window-hex]")
        this.name_ele.innerText = this.name
        this.pid_ele.innerText = this.pid
        this.hex_ele.innerText = this.hex
        this.kill_btn = this.element.querySelector("button[data-window-kill]")
        this.show_btn = this.element.querySelector("button[data-window-show]")
        this.hide_btn = this.element.querySelector("button[data-window-hide]")
        this.element.hidden=false
        this.show_btn.onclick = () => {
            this.show_windows("max")
        }
        this.hide_btn.onclick = () => {
            this.show_windows("min")
        }
        this.kill_btn.onclick = () => {
            this.kill()
        }
    }

    this.remove = () => {
        this.element.parentNode.removeChild(this.element)
    }

    this.show_windows = (ty) => {
        post_ajax_new("/api/showpid", "post", JSON.stringify({"hex": this.hex, "type": ty}), null, (data) => {
            console.log("")
        }, () => {
            snack("warning", "Window show failed")
        }, null)
    }

    this.kill = () => {
        post_ajax_new("/api/killpid", "post", JSON.stringify({"pid": this.pid}), null, (data) => {
            this.remove()
        }, () => {
            snack("warning", "App kill failed")
        }, null)
    }
    this.create(parent)

}

// Keyboard object handles the sending of keyboard messages to the server.

function Keyboard() {
    this.key_input = document.getElementById("media_text_box")
    this.key_button = document.getElementById("keyboard_send")
    this.key_code_input = document.getElementById("send_key_code_input")
    this.key_code_button = document.getElementById("send_key_code_button")
    this.send_text = () => {

        data = JSON.stringify({"text": String(this.key_input.value)})
        log.log_start()
        post_ajax_new("/api/sendtype", "post", data, null, this.clear_box, () => {
                log.log_trans("keyboard", false)
                snack("warning", "Keyboard send failed")
            }
            , null)

    }
    this.send_key = (key) => {
        data = JSON.stringify({"text": String(key)})
        post_ajax_new("/api/sendkey", "post", data, null, this.clear_box, () => {
                log.log_trans("keyboard", false)
                snack("warning", "Keyboard send failed")
            }, null
        )
    }

    this.clear_box = () => {
        this.key_input.value = ""
        log.log_end()
        log.log_trans("keyboard", true)
    }

    // set onclick for all kdb items
    var pc_keys = document.querySelectorAll("button[data-kdb]")
    for (const itm in pc_keys) {
        pc_keys[itm].onclick = () => {
            this.send_key(pc_keys[itm].id)
        }
    }
    this.key_button.onclick = this.send_text
    this.key_input.onkeypress = this.send_text

    this.key_code_button.onclick = () => {
        this.send_key(this.key_code_input.value)
        this.key_code_input.value = ""
    }

}

// mouse object handles sending of mouse movements to the server
function Mouse() {

    this.time_last_send = new Date()
    this.x = 0
    this.y = 0
    this.old_x = 0
    this.old_y = 0
    this.x_diff = 0
    this.y_diff = 0
    this.screen_x = screen.width
    this.screen_y = screen.height
    this.left_click_button = document.getElementById("mouse_click_left")
    this.right_click_button = document.getElementById("mouse_click_right")
    this.double_click_button = document.getElementById("mouse_click_double")

    this.log_pos = (cur_x, cur_y) => {
        this.old_x = this.x
        this.old_y = this.y
        this.x_diff = cur_x - this.x
        this.x = cur_x
        this.y_diff = cur_y - this.y
        this.y = cur_y
    }

    this.update_mouse = (event, id_val) => {

        if (event.touches.length > 0) {

            if (this.x_diff > this.screen_x * .10) {
                this.x_diff = this.screen_x * .10

            }
            if (this.y_diff > this.screen_y * .10) {
                this.y_diff = this.screen_y * .10

            }

            var sX = event.touches[0].screenX;
            var sY = event.touches[0].screenY;
            // Log and move mouse if needed
            mouse.log_pos(sX, sY)
            mouse.send_mouse_move()

            //log to screen
            var x_ele = document.querySelector("#" + id_val + " #Screen #x")
            var x_diff_ele = document.querySelector("#" + id_val + " #Screen #x_diff")
            var y_ele = document.querySelector("#" + id_val + " #Screen #y")
            var y_diff_ele = document.querySelector("#" + id_val + " #Screen #y_diff")

            x_diff_ele.innerText = Math.round(mouse.x_diff, 2)
            x_ele.innerText = Math.round(mouse.x, 2)
            y_diff_ele.innerText = Math.round(mouse.y_diff, 2)
            y_ele.innerText = Math.round(mouse.y, 2)
        } else {
            this.reset_mouse()
        }
    }

    this.send_mouse_move = () => {
        if (this.x != this.x_diff && this.y != this.y_diff && this.ok_to_send == true) {
            current_date = new Date()
            if (document.getElementById("accept_touch").checked == true & (current_date - this.time_last_send) > settings.touch_send_ms) {
                log.log_start()
                this.time_last_send = current_date

                var moves = settings.multiply_mouse_speed(this.x_diff, this.y_diff)

                let mouse_data = JSON.stringify({
                    "x": moves[0],
                    "y": moves[1],
                })

                this.ok_to_send = false
                post_ajax_new("/api/sendscreen", "post", mouse_data, null, () => {
                    this.ok_to_send = true
                    log.log_end()
                    log.log_trans("mouse", true)
                }, () => {
                    this.ok_to_send = true
                    log.log_end()
                    log.log_trans("mouse", false)
                }, null)
            }
        }
    }
    this.ok_to_send = true

    this.click_mouse = (type) => {
        data = JSON.stringify({"click": type})
        post_ajax_new("/api/sendclick", "post", data, null, null, null, null)
    }

    this.reset_mouse = () => {
        this.x = 0
        this.y = 0
        this.x_diff = 0
        this.y_diff = 0
    }


    //window.ontouchmove = (e) => {
    //    this.update_mouse(e, 'touch_start')
    //}
    //window.ontouchend = (e) => {
    //    this.reset_mouse()
    //}

    //set click buttons
    this.left_click_button.onclick = () => {
        this.click_mouse("left")
    }
    this.right_click_button.onclick = () => {
        this.click_mouse("right")
    }
    this.double_click_button.onclick = () => {
        this.click_mouse("double")
    }
}

// Media list object handles the list of media items stored in the users directory.

function MediaList() {
    this.playing_pid = ""
    this.loading_ele = document.getElementById("media_loading")
    this.refresh_button = document.getElementById("media_refresh_button")
    this.refresh_button.onclick = () => {
        this.reset_list()
    }


    this.kill_button = document.getElementById("media_kill")
    this.kill_button.onclick = () => {
        post_ajax_new("/api/playmedia",
            "post",
            JSON.stringify({"kill": "yes"}),
            null,
            (data) => {
                console.log("MPV Killed")
            },
            null,
            null)
    }
    this.search_box = document.getElementById("media_search_box")
    this.search_area = document.getElementById("media_search_section")
    this.media_list = []

    this.reset_list = () => {
        this.playing_pid = ""

        for (const med in this.media_list) {
            var single_med = this.media_list[med]
            single_med.element.parentNode.removeChild(single_med.element)
        }
        this.media_list = []
        this.get()
    }
    this.get = () => {
        this.show_loading()
        post_ajax_new("/api/getmedia", "get", null, null, (data) => {
            const data_new = JSON.parse(data)
            for (const dt in data_new) {
                this.media_list.push(new MediaItem(data_new[dt]))
            }
            this.finish_loading()
        }, null, null)
    }
    this.show_loading = () => {
        this.loading_ele.hidden = false
        this.search_area.hidden = true
        this.kill_button.hidden = true
        this.refresh_button.hidden = true
    }
    this.finish_loading = () => {
        this.loading_ele.hidden = true
        this.search_area.hidden = false
        this.kill_button.hidden = false
        this.refresh_button.hidden = false
    }


    this.search = () => {
        for (itm in this.media_list) {
            let it = this.media_list[itm]
            if (it.name.toLocaleLowerCase().includes(this.search_box.value.toLocaleLowerCase())) {
                it.show()
            } else {
                it.hide()
            }
        }
    }

    this.search_box.onkeyup = this.search

    this.get()

}

// base media item - handles the running of video clips etc


function MediaItem(data) {
    this.name = data.name
    this.path = data.path
    this.duration = data.duration
    this.size = String(Math.round(data.size, 2)) + "MB"
    this.reso = data.reso

    this.play = () => {
    }
    this.show = () => {
        this.element.hidden = false
    }
    this.hide = () => {
        this.element.hidden = true
    }
    this.create_element = () => {
        let med = document.getElementById("media-base")
        this.element = med.cloneNode(true)
        med.parentElement.appendChild(this.element, med.nextSibling)
        //this.show()
    }
    this.play_ele = () => {
        data = {"play_pid": media_list.playing_pid, "filename": this.path}
        JSON.stringify(data)
        post_ajax_new("/api/playmedia",
            "post",
            JSON.stringify(data),
            null,
            (data) => {
                media_list.playing_pid = JSON.parse(data).pid
            },
            null,
            null)
    }
    this.create_element()

    this.name_ele = this.element.querySelector("div[data-media-name]")
    this.name_ele.innerText = this.name
    this.res_ele = this.element.querySelector("span[data-media-resolution]")
    this.res_ele.innerText = this.reso
    this.size_ele = this.element.querySelector("span[data-media-size]")
    this.size_ele.innerText = this.size
    this.duration_ele = this.element.querySelector("span[data-media-duration]")
    this.duration_ele.innerText = this.duration

    this.play_button_ele = this.element.querySelector("button[data-media-button]")
    this.play_button_ele.onclick = this.play_ele


}
