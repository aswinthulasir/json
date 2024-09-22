const fs = require('fs');
const path = require('path');
const http = require('http');


const filePath = path.join(__dirname, 'hospitals.json');

const readData = () => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

//Read the code from here for the url analyzis and corresponding methods to be given in postman



const createHospital = (hospital) => {
  const data = readData();
  data.hospitals.push(hospital);
  writeData(data);
  return 'Hospital added successfully!';
};

// READ
const readHospitals = () => {
  const data = readData();
  return JSON.stringify(data.hospitals, null, 2);
};

// UPDATE
const updateHospital = (hospitalName, updatedHospital) => {
  const data = readData();
  const index = data.hospitals.findIndex((h) => h.name === hospitalName);
  
  if (index !== -1) {
    data.hospitals[index] = { ...data.hospitals[index], ...updatedHospital };
    writeData(data);
    return `${hospitalName} updated successfully!`;
  } else {
    return 'Hospital not found.';
  }
};

// DELETE
const deleteHospital = (hospitalName) => {
  const data = readData();
  const filteredHospitals = data.hospitals.filter((h) => h.name !== hospitalName);
  
  if (data.hospitals.length !== filteredHospitals.length) {
    data.hospitals = filteredHospitals;
    writeData(data);
    return `${hospitalName} deleted successfully!`;
  } else {
    return 'Hospital not found.';
  }
};

//server
const server = http.createServer((req, res) => {
  const { url, method } = req;

  // Routes
  if (url === '/hospitals' && method === 'GET') {
    //READ operation
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(readHospitals());
  } else if (url === '/add-hospital' && method === 'POST') {
    //CREATE operation
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newHospital = JSON.parse(body);
      const message = createHospital(newHospital);
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end(message);
    });
  } else if (url.startsWith('/update-hospital') && method === 'PUT') {
    // UPDATE operation
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { name, updatedHospital } = JSON.parse(body);
      const message = updateHospital(name, updatedHospital);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(message);
    });
  } else if (url.startsWith('/delete-hospital') && method === 'DELETE') {
    // DELETE operation
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { name } = JSON.parse(body);
      const message = deleteHospital(name);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(message);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

//port 4000
server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
