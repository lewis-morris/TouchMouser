import json
import os

from flask import make_response, request
from flask_restful import reqparse, Resource
from flask import jsonify
from TouchMouser import g
parser = reqparse.RequestParser()
import pyautogui
import pyscreenshot as ImageGrab
import base64
from io import BytesIO


class GetRemoteScreen(Resource):

    def get(self):
        screensize = pyautogui.size()
        return make_response(jsonify({"x": screensize[0], "y": screensize[1]}), 200)

class GetScreen(Resource):
    def get(self):
        screen = ImageGrab.grab()
        buffered = BytesIO()
        screen.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue())
        return make_response(jsonify({"image": "data:image/jpeg;base64, " + img_str.decode()}), 200)


class SendScreen(Resource):

    def post(self):
        currentx = pyautogui.position().x
        currenty = pyautogui.position().y
        data = json.loads(request.get_json(force=True))
        try:
            pyautogui.moveTo(currentx - data["x"],currenty - data["y"])
            return make_response(jsonify({"ok": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "pyautogui error "}), 400)

class SendType(Resource):

    def post(self):
        data = json.loads(request.get_json(force=True))
        try:
            pyautogui.write(data["text"])

            return make_response(jsonify({"ok": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "pyautogui error "}), 400)


class SendKey(Resource):

    def post(self):

        data = json.loads(request.get_json(force=True))
        try:
            if pyautogui.isValidKey(data["text"]):
                pyautogui.press(data["text"])
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