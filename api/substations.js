module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Return dummy data for now
    const substations = [
      {
        id: "1",
        no: 1,
        ulp: "ULP A",
        noGardu: "G001",
        namaLokasiGardu: "Gardu Distribusi A",
        jenis: "Portal",
        merek: "ABB",
        daya: "100 kVA",
        tahun: "2020",
        phasa: "3",
        tap_trafo_max_tap: "5",
        penyulang: "P1",
        arahSequence: "RST",
        tanggal: "2025-08-01T00:00:00.000Z",
        status: "normal",
        lastUpdate: "2025-08-01T00:00:00.000Z",
        is_active: 1,
        ugb: 0,
        latitude: -6.2088,
        longitude: 106.8456
      },
      {
        id: "2",
        no: 2,
        ulp: "ULP B",
        noGardu: "G002",
        namaLokasiGardu: "Gardu Distribusi B",
        jenis: "Cantol",
        merek: "Siemens",
        daya: "200 kVA",
        tahun: "2021",
        phasa: "3",
        tap_trafo_max_tap: "5",
        penyulang: "P2",
        arahSequence: "RST",
        tanggal: "2025-08-01T00:00:00.000Z",
        status: "normal",
        lastUpdate: "2025-08-01T00:00:00.000Z",
        is_active: 1,
        ugb: 1,
        latitude: -6.2088,
        longitude: 106.8456
      }
    ];

    res.json({
      success: true,
      data: substations
    });
  } catch (err) {
    console.error('Substations error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}; 