import handler from '../api/export/substation-detail.js';

const id = process.argv[2];
if (!id) {
  console.error('Usage: node scripts/debug-substation-export.js <substationId>');
  process.exit(1);
}

const req = {
  method: 'GET',
  query: { id },
  headers: {},
};

const chunks = [];

const res = {
  statusCode: 200,
  headers: {},
  setHeader(key, value) {
    this.headers[key] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log('JSON response', this.statusCode || 200, data);
  },
  end() {
    console.log('Response ended. Status:', this.statusCode || 200);
    if (chunks.length) {
      const buf = Buffer.concat(chunks);
      console.log('Binary response bytes:', buf.length);
    }
  },
  write(chunk) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk);
    }
  }
};

handler(req, res)
  .then(() => console.log('Handler resolved'))
  .catch((err) => {
    console.error('Handler rejected:', err);
  });
