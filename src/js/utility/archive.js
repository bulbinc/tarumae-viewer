import Tarumae from "../entry"
import "pako"

Tarumae.Utility.Archive = class {
	constructor() {
		this.isLoading = false;
		this.dataLength = 0;
		this.loadingLength = 0;
		this.chunkListeners = {};
	}

	onChunkReady(uid, callback) {
		var chunkListeners = this.chunkListeners[uid];
		if (!chunkListeners) {
			chunkListeners = [];
			this.chunkListeners[uid] = chunkListeners;
		}
		chunkListeners.push(callback);
	}

	callChunkReady(uid, buffer) {
		var chunkListeners = this.chunkListeners[uid];
		if (!chunkListeners) return;
		for (var i = 0; i < chunkListeners.length; i++) {
			chunkListeners[i](buffer);
		}
	}

	loadFromStream(data) {
		var headerBuffer = new Uint32Array(data.slice(0, 32));
		
		if (headerBuffer[0] != 0x61626f73) return null;
		
		var verflags = headerBuffer[1];
		var ver = verflags & 0xffff;
		if (ver !== 0x0100) return null;
	
		var pos = headerBuffer[2];
		var chunkStartPos = pos;
		
		pos += headerBuffer[4];
		verflags = headerBuffer[5];
		var chunkCount = headerBuffer[6];
	
		if (chunkCount > 0x1FFFE) {
			// invalid chunk count
			return null;
		}
		
		var archive = this;
		archive.chunks = {};
	
		var readChunks = function() {
			var _blockLen = 24;
			var chunkBuffer = data.slice(pos, pos + _blockLen);
			var chunkHeaderBuffer = new Uint32Array(chunkBuffer);
			var uid = chunkHeaderBuffer[0];
			var chunkOffset = chunkHeaderBuffer[2];
			var chunkLength = chunkHeaderBuffer[3];
			var offset = chunkStartPos + chunkOffset;
			var flags = chunkHeaderBuffer[4];
			var trunkFlags = flags & 0xffff;
	
			var index = new Tarumae.Utility.ArchiveChunk(uid, chunkHeaderBuffer[1], trunkFlags,
				chunkOffset, chunkLength, data.slice(offset, offset + chunkLength));
	
			archive.chunks[uid] = index;
	
			pos += _blockLen;
		};
		
		for (var i = 0; i < chunkCount; i++) {
			readChunks();
		}

		this.chunks._s3_foreach(function(uid, chunk) {
			archive.callChunkReady(parseInt(uid), chunk.data);
		});
	}

	getChunkData(uid, format) {
		var chunk = this.chunks[uid];
		if (!chunk) return null;

		if (format) {
			if (chunk.format != format) {
				return null;
			}
		}

		return chunk.data;
	}
};

Object.defineProperties(Tarumae.Utility.Archive, {
	canLoadFromArchive: {
		value: function(scene, value, callback) {
			var matches = value.match(/sob:\/\/(\w+)\/(\w+)/i);
			if (matches !== null && matches.length >= 3) {
				var archive = scene._archives[matches[1]].archive;
				var uid = parseInt(matches[2], 16);
				archive.onChunkReady(uid, function(buffer) {
					callback.call(scene, buffer, archive, uid);
				});
				return true;
			}
			return false;
		}
	},

	createFromStream: {
		value: function(data) {		
			var archive = new Archive();
			archive.loadFromStream(data);
			return archive;
		}
	},
});

Tarumae.Utility.ArchiveChunk = class {
	constructor(uid, format, flags, offset, length, buffer) {
		this.uid = uid;
		this.format = format;
		this.flags = flags;
		this.offset = offset;
		this.length = length;
		this.buffer = buffer;
	}

	get data() {
		if (!this.buffer) return null;
			
		if (this.flags & 0x1) {
			return pako.inflate(this.buffer).buffer;
		} else {
			return this.buffer;
		}
	}
}
