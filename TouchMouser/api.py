import json
import os

from flask import make_response, request
from flask_restful import reqparse, Resource
from flask import jsonify
from TouchMouser import g
parser = reqparse.RequestParser()
import pyautogui

class GetRemoteScreen(Resource):

    def get(self):
        screensize = pyautogui.size()
        return make_response(jsonify({"x": screensize[0], "y": screensize[1]}), 200)


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
            pyautogui.press(data["text"])
            return make_response(jsonify({"ok": "ok"}), 200)
        except:
            return make_response(jsonify({"error": "pyautogui error "}), 400)

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