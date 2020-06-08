from TouchMouser import create_app
import socket
def getNetworkIp():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    s.connect(('<broadcast>', 0))
    return s.getsockname()[0]

app = create_app()

if __name__ == '__main__':
    ## IF NOT RUNNING ON CORRECT IP PLEASE CHANGE THE HOST BELOW
    app.run(debug=True, host=str(getNetworkIp()))

