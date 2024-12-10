from flask import Flask, jsonify
from flask_cors import CORS
from capture import capture_packets

app = Flask(__name__)
CORS(app)

@app.route('/api/packets', methods=['GET'])
def getpackets():
    packets = capture_packets()
    return jsonify(packets) 

if __name__ == '__main__':
    app.run(debug=True)