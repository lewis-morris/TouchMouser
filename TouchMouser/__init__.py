
from flask import Flask

from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

from flask import g,current_app

from TouchMouser.api import SendScreen, GetRemoteScreen, SendType, SendClick, SendKey, GetScreen
from TouchMouser.config import AppConfig
from TouchMouser.main.routes import main

db = SQLAlchemy()
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

    api.init_app(app)
    app.register_blueprint(main)


    return app

