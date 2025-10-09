'use client';

import { useEffect, useState } from 'react';
import './style.css'; // ✅ import CSS

export default function BikeListPage() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/bikes')
      .then(res => res.json())
      .then(setBikes);
  }, []);

  const filteredBikes = bikes.filter(bike =>
    bike.Bicycle_ID.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ ฟังก์ชันคืน class สีตามสถานะ
  const getStatusClass = (status) => {
    switch (status) {
      case 'ว่าง':
        return 'status-available';
      case 'อยู่ระหว่างการตรวจสอบ':
        return 'status-pending';
      case 'ไม่พร้อมใช้งาน':
        return 'status-unavailable';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="container">
      <h1 className="heading">🚲 รายการจักรยาน</h1>

      {/* ✅ Search Box */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="ค้นหาตามรหัสจักรยาน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '250px'
          }}
        />
      </div>

      {filteredBikes.length === 0 ? (
        <p>❌ ไม่พบจักรยาน</p>
      ) : (
        <table className="bike-table">
          <thead>
            <tr>
              <th>เลขทะเบียนจักรยาน</th>
              <th>รูป</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredBikes.map(bike => (
              <tr key={bike.Bicycle_ID}>
                <td>{bike.Bicycle_ID}</td>
                <td>
                  <img src={bike.Image} alt="bike" className="bike-img" width="80" />
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(bike.Bicycle_Status)}`}>
                    {bike.Bicycle_Status}
                  </span>
                </td>
                <td>
                  {bike.Bicycle_Status === 'ว่าง' ? (
                    <button
                      className="action-btn"
                      onClick={() =>
                        window.location.href = `/nisit/request/borrow/${bike.Bicycle_ID}`
                      }
                    >
                      จองจักรยาน
                    </button>
                  ) : (
                    <button className="action-btn" disabled>ไม่ว่าง</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
