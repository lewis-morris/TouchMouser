
from flask import Flask

from flask_restful import Api

from flask import g,current_app

from TouchMouser.api import SendScreen, GetRemoteScreen, SendType, SendClick, SendKey, GetScreen, LoadProgram, GetPIDs, \
    ReturnProgram, KillPID, GetMedia, PlayMedia, ShowPIDs
from TouchMouser.config import AppConfig
from TouchMouser.main.routes import main

api = Api()



def create_app(config_class =[AppConfig]):

    app = Flask(__name__)
    app.config.from_object(AppConfig)

    api.add_resource(GetRemoteScreen,"/api/getremotescreen")
    api.add_resource(SendScreen, "/api/sendscreen")
    api.add_resource(SendType, "/api/sendtype")
    api.add_resource(SendKey, "/api/sendkey")
    api.add_resource(SendClick, "/api/sendclick")
    api.add_resource(GetScreen, "/api/getscreen")

    api.add_resource(LoadProgram, "/api/loadprogram")
    api.add_resource(GetPIDs, "/api/getpids")
    api.add_resource(ReturnProgram, "/api/returnprogram")
    api.add_resource(KillPID, "/api/killpid")
    api.add_resource(ShowPIDs, "/api/showpid")

    api.add_resource(GetMedia, "/api/getmedia")
    api.add_resource(PlayMedia, "/api/playmedia")


    api.init_app(app)
    app.register_blueprint(main)


    return app

