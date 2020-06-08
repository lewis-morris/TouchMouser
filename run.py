from TouchMouser import create_app
import socket

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host=str(socket.gethostbyname(socket.gethostname())))

