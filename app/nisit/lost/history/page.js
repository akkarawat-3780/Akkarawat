'use client';

import { useEffect, useState } from 'react';
import './style.css'; // ✅ import CSS แยกไฟล์

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

export default function LostHistoryPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    const res = await fetch('/api/loss-report/history');
    const data = await res.json();
    setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r =>
    r.LossReport_ID.toLowerCase().includes(search.toLowerCase()) ||
    r.Borrow_ID.toLowerCase().includes(search.toLowerCase()) ||
    r.Bicycle_ID.toLowerCase().includes(search.toLowerCase()) ||
    r.LossReport_Status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusClass = (status) => {
    if (status === "อนุมัติการชำระเงิน") return "approved";
    if (status === "ไม่อนุมัติการแจ้งหาย" || status === "ชำระเงินไม่ถูกต้อง") return "rejected";
    if (status === "รรอตรวจสอบการชำระเงิน" || status === "รอการชำระเงิน") return "lost-pending";
    return "pending";
  };

  return (
    <div className="container">
      <h1 className="heading">🚨 ประวัติการแจ้งหาย</h1>

      {/* ✅ Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาด้วยรหัส/สถานะ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredReports.length === 0 ? (
        <p>ไม่มีประวัติการแจ้งหาย</p>
      ) : (
        <table className="bike-table">
          <thead>
            <tr>
              <th>รหัสแจ้งหาย</th>
              <th>รหัสการจอง</th>
              <th>เลขทะเบียนจักรยาน</th>
              <th>วันที่แจ้ง</th>
              <th>ใบเสร็จ</th>
              <th>สถานะ</th>
              <th>ผู้ตรวจสอบ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(r => (
              <tr key={r.LossReport_ID}>
                <td>{r.LossReport_ID}</td>
                <td>{r.Borrow_ID}</td>
                <td>{r.Bicycle_ID}</td>
                <td>{formatDate(r.LossReport_Date)}</td>
                <td>
                  {r.LossReport_receipt ? (
                    <a
                      href={r.LossReport_receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 เปิดสลิป
                    </a>
                  ) : "-"}
                </td>
                <td>
                  <span className={`status ${getStatusClass(r.LossReport_Status)}`}>
                    {r.LossReport_Status}
                  </span>
                </td>
                <td>{r.admin_email || "-"}</td>
                <td>
                  {r.LossReport_Status === "รอการชำระเงิน" && (
                    <button
                      onClick={() =>
                        (window.location.href = `/nisit/lost/${r.LossReport_ID}`)
                      }
                      className="cancel-btn"
                    >
                      💳 ไปหน้าชำระเงิน
                    </button>
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
