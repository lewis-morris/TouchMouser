import json
import os
import os
import subprocess
from io import BytesIO
import base64
from PIL import Image
import os
import datetime
from flask import make_response, request
from flask_restful import reqparse, Resource
from flask import jsonify
from TouchMouser import g
parser = reqparse.RequestParser()
import pyautogui
import pyscreenshot as ImageGrab
import base64
from io import BytesIO
pyautogui.FAILSAFE = False

class GetMedia(Resource):

    def get(self):
        return make_response(jsonify(self.get_media_files()), 200)

    @staticmethod
    def get_media_files():

        out = os.popen("""find ~ -type f \( -iname \*.mp4 -o -iname \*.mpg -o -iname \*.mkv \)""").read().split(
            "\n")
        out = [x for x in out if x != ""]
        final_file_dict = {}
        for fl in out:
            fl_info = os.popen(f"""mediainfo --Output=JSON '{fl}'""").read().split("\n")
            fl_dic = {f.split(":")[0].replace('"', ""): f.split(":")[1].replace('"', "") for f in fl_info if
                      f.find(":") > -1}
            fl_dic
            if "Duration" in fl_dic.keys():
                fl_ob = {"name": fl.split("/")[-1],
                         "path": fl,
                         "duration": (datetime.datetime(2020, 1, 1, 0, 0, 0, 0) + datetime.timedelta(
                             seconds=float(fl_dic["Duration"].replace(",", "").replace(" ", "")))).strftime(
                             "%H:%m:%s")[:8],
                         "reso": f"{fl_dic['Width'].replace(',', '').replace(' ', '')} x {fl_dic['Height'].replace(',', '').replace(' ', '')}",
                         "size": float(fl_dic["FileSize"].replace(",", "").replace(" ", "").replace('"', "")) / (
                             1e+6)}
                final_file_dict[fl_ob["name"]] = fl_ob
        return final_file_dict

class PlayMedia(Resource):

    def post(self):
        data = json.loads(request.get_json(force=True))
        if "kill" in data.keys():
            os.popen("kill $(pidof mpv)")
            return make_response(jsonify({"killed": "yes"}), 200)
        else:
            try:
                pid = os.popen(f"""bash {os.getcwd()}/TouchMouser/runmpv.sh '{data['filename']}'""").read()
                return make_response(jsonify({"pid":pid}), 200)
            except:
                return make_response(jsonify({"error": "mpv error "}), 400)


class GetRemoteScreen(Resource):

    def get(self):
        #get screensize and return
        screensize = pyautogui.size()
        return make_response(jsonify({"x": screensize[0], "y": screensize[1]}), 200)

class GetScreen(Resource):

    def get(self):
        #get screenshot
        screen = ImageGrab.grab()
        buffered = BytesIO()
        screen.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue())
        return make_response(jsonify({"image": "data:image/jpeg;base64, " + img_str.decode()}), 200)


class SendScreen(Resource):

    def post(self):

        #some times mose movments were being cancelled by pyautogui so this fixes things
        #(although not recomended)
        pyautogui.FAILSAFE = False

        currentx = pyautogui.position().x
        currenty = pyautogui.position().y
        data = json.loads(request.get_json(force=True))

        size =pyautogui.size()
        width = size.width
        height = size.height

        try:

            #this is used to limit erroneous large movements a set width.
            # havent been able to diagnose the cause of the spikes of movment but have
            # a feeling its something on the javascript end of things.

            #fix spikes
            if abs(data["x"]) > width * .2:
                if data["x"] < 0:
                    data["x"] = (width * .2)*-1
                else:
                    data["x"] = (width * .2)
            x_move = currentx - data["x"]

            #move to screen boundry if overspills
            if x_move > width:
                x_move = width
            elif x_move < 0:
                x_move = 0

            # fix spikes
            if abs(data["y"]) > height * .2:
                if data["y"] < 0:
                    data["y"] = (height * .2)*-1
                else:
                    data["y"] = (height * .2)
            y_move = currenty - data["y"]

            # move to screen boundry if overspills
            if y_move > height:
                y_move = height
            elif y_move < 0:
                y_move = 0

            pyautogui.moveTo(x_move, y_move)

            return make_response(jsonify({"ok": "ok"}), 200)
        except Exception as e:
            print(e)
            return make_response(jsonify({"error": "pyautogui error "}), 400)

class SendType(Resource):

    def post(self):
        data = json.loads(request.get_json(force=True))
        try:
            pyautogui.write(data["text"])

        except:
            return make_response(jsonify({"error": "pyautogui error "}), 400)

class LoadProgram(Resource):

    def post(self):

        data = json.loads(request.get_json(force=True))
        try:
            proc = os.popen("nohup " + data["ex"] + " 1>/dev/null 2>/dev/null & disown")

            return make_response(jsonify({"pid": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "general error "}), 400)

class GetPIDs(Resource):

    def post(self):
        in_data = request.get_json(force=True)

        data = json.loads(in_data)

        try:
            if data["proc_two"] != "":
                pid = os.popen(f"""bash {os.getcwd()}/TouchMouser/pids.sh "check" "{data["proc"]}" "{data["proc_one"]}" "{data["proc_three"]}" "{data["proc_two"]}" """).read().replace("\n","")
            else:
                pid = os.popen(f"""bash {os.getcwd()}/TouchMouser/pids.sh "check" "{data["proc"]}" "{data["proc_one"]}" "{data["proc_three"]}" "none" """).read().replace("\n","")

            windows_pid_dic = {}
            if pid.find("££") > -1:
                pids = pid.split(",")[0]
                windows = pid.split(",")[1]
                #windows_pid_dic[pids] = {}

                for line in [ln for ln in windows.split("££") if ln.strip() != '' ]:

                    pid_line = line.split("-+-")
                    pid_sing = pid_line[0].strip()
                    if not pid_sing in windows_pid_dic.keys():
                        windows_pid_dic[pid_sing] = {}

                    for win in [wn for wn in pid_line[1].split("|") if wn.strip() != ""]:

                        name = win[:-10]
                        winhex = win[-10:]
                        windows_pid_dic[pid_sing][winhex] = {"name": name, "winhex": winhex, "pid":pid_sing}

                return make_response(jsonify({"pid": pids.replace("\n", ""), "windows": windows_pid_dic}), 200)
            return make_response(jsonify({"pid": pid.replace("\n",""),"windows":""}), 200)
        except Exception as e:
            print(e)
            return make_response(jsonify({"error": "general error "}), 400)

class ShowPIDs(Resource):

    def post(self):
        in_data = request.get_json(force=True)
        data = json.loads(in_data)

        try:
            if "pid" in data.keys():
                typ= "pid"
                dt = data["pid"].split(" ")
            else:
                typ = "hex"
                dt = data["hex"].split(" ")

            for window_id in dt:
                if data["type"] == "max":
                    _ = os.popen(f"""bash {os.getcwd()}/TouchMouser/showpid.sh "{window_id}" "max" "{typ}" """).read()
                else:
                    _ = os.popen(f"""bash {os.getcwd()}/TouchMouser/showpid.sh "{window_id}" "min" "{typ}" """).read()

            return make_response(jsonify({"status": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "general error "}), 400)


class ReturnProgram(Resource):

    def get(self):
        try:
            dic = self.get_applications()
            return make_response(jsonify(dic), 200)
        except:
            return make_response(jsonify({"error": "general error "}), 400)


    @staticmethod
    def get_applications():

        def get_base_from_image_path(path):
            data = open(path, "rb").read()
            return base64.b64encode(data).decode()

        # apps = [x for x in os.popen(f"""bash {os.getcwd()}/TouchMouser/get_apps.sh """).read().split("\n") if x != ""]
        apps = [json.loads(x) for x in
                os.popen(f"""bash {os.getcwd()}/TouchMouser/get_apps.sh """).read().split(
                    "\n") if x != ""]

        final_apps = {}

        for ap in apps:
            # print(ap)
            icons = [x for x in ap["icons"].split(" /") if x.find("hicol") > -1 or x.find(".") > -1]
            svg = [x for x in icons if x.find("svg") > -1]
            if svg:
                base_img = get_base_from_image_path("/" + svg[-1])
                img_ext = svg[-1].split(".")[-1]

            elif len(icons) == 0 or ("xpm" in icons and len(icons) == 1):
                base_img = get_base_from_image_path("./content/question.png")
                img_ext = ".png"

            else:
                base_img = get_base_from_image_path("/" + icons[-1])
                img_ext = icons[-1].split(".")[-1]

            final_img = f"data:image/{img_ext};base64," + base_img
            ap["icons"] = final_img
            ap_temp = {ap["app_name"]: ap}
            final_apps = {**final_apps, **ap_temp}

        return final_apps


class KillPID(Resource):
    def post(self):
        data = json.loads(request.get_json(force=True))
        try:
            if "pid" in data.keys():
                os.popen(f"kill {data['pid']}")
            else:
                if data["proc_two"] != None:
                    pid = os.popen(f"""bash {os.getcwd()}/TouchMouser/pids.sh "kill" "{data["proc"]}" "{data["proc_one"]}" "{data["proc_three"]}" "{data["proc_two"]}" """).read()
                else:
                    pid = os.popen(f"""bash {os.getcwd()}/TouchMouser/pids.sh "kill" "{data["proc"]}" "{data["proc_one"]}" "{data["proc_three"]}" "none" """).read()

        except:
            return make_response(jsonify({"error": "general error "}), 400)


class SendKey(Resource):

    def post(self):

        data = json.loads(request.get_json(force=True))
        try:
            if pyautogui.isValidKey(data["text"].lower()):
                pyautogui.press(data["text"].lower())
            else:
                if not self.send_multimedia_keys(data["text"]):
                    raise ValueError("Terminal Error")

            return make_response(jsonify({"ok": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "pyautogui error "}), 400)

    @staticmethod
    def send_multimedia_keys(key):
        keys = {"mute":"XF86AudioMute",
                "play":"XF86AudioPlay",
                "previous":"XF86AudioPrev",
                "next": "XF86AudioNext",
                "volumeup":"XF86AudioRaiseVolume",
                "volumedown":"XF86AudioLowerVolume",
                "stop":"XF86AudioStop",
                "sleep":"XF86Sleep"}

        if key in keys.keys():
            os.system("xdotool key " + keys[key])
            return True
        else:

            return False

class SendClick(Resource):

    def post(self):

        data = json.loads(request.get_json(force=True))
        try:
            if data["click"] == "left":
                pyautogui.click()
            elif data["click"] == "double":
                pyautogui.doubleClick()
            elif data["click"] == "right":
                pyautogui.rightClick()
            return make_response(jsonify({"ok": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "pyautogui error "}), 400)
