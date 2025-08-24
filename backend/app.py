from flask import Flask, jsonify, request
from flask_cors import CORS
from capture import capture_packets, get_cached_packets
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['PACKET_COUNT'] = int(os.environ.get('PACKET_COUNT', 10))
app.config['CACHE_TIMEOUT'] = int(os.environ.get('CACHE_TIMEOUT', 30))

@app.route('/api/packets', methods=['GET'])
def get_packets():
    """Get network packets with optional caching."""
    try:
        use_cache = request.args.get('cache', 'true').lower() == 'true'
        count = int(request.args.get('count', app.config['PACKET_COUNT']))
        
        if use_cache:
            packets = get_cached_packets(count)
        else:
            packets = capture_packets(count)
            
        logger.info(f"Returning {len(packets)} packets")
        return jsonify({
            'packets': packets,
            'count': len(packets),
            'timestamp': packets[0]['timestamp'] if packets else None
        })
    except Exception as e:
        logger.error(f"Error capturing packets: {str(e)}")
        return jsonify({
            'error': 'Failed to capture packets',
            'message': str(e),
            'packets': [],
            'count': 0
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'osi-visualizer-backend'})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    app.run(host='127.0.0.1', port=port, debug=debug)