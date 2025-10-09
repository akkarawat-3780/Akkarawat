"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePicker, ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import "./style.css";

dayjs.locale("th");

export default function Dashboard() {
  const [borrowData, setBorrowData] = useState([]);
  const [lossData, setLossData] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("ทั้งหมด");
  const [selectedMonth, setSelectedMonth] = useState("");

  // โหลดข้อมูลสถิติการยืม
  const fetchBorrowStats = async () => {
    try {
      const query = new URLSearchParams();
      if (selectedFaculty !== "ทั้งหมด") query.append("faculty", selectedFaculty);
      if (selectedMonth) query.append("month", selectedMonth);

      const res = await fetch(`/api/dashboard/borrow-stats?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const raw = await res.json();

      const grouped = {};
      raw.forEach((row) => {
        if (!grouped[row.faculty_name])
          grouped[row.faculty_name] = { faculty: row.faculty_name };
        grouped[row.faculty_name][row.borrow_status] = row.count;
      });

      const uniqueFaculties = [...new Set(raw.map((r) => r.faculty_name))];
      setFaculties(uniqueFaculties);
      setBorrowData(Object.values(grouped));
    } catch (err) {
      console.error("โหลด borrow-stats error:", err);
    }
  };

  // โหลดข้อมูลสถิติแจ้งหาย
  const fetchLossStats = async () => {
    try {
      const query = new URLSearchParams();
      if (selectedFaculty !== "ทั้งหมด") query.append("faculty", selectedFaculty);
      if (selectedMonth) query.append("month", selectedMonth);

      const res = await fetch(`/api/dashboard/loss-stats?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const raw = await res.json();

      const grouped = {};
      raw.forEach((row) => {
        if (!grouped[row.faculty_name])
          grouped[row.faculty_name] = { faculty: row.faculty_name };
        grouped[row.faculty_name][row.status] = row.count;
      });

      setLossData(Object.values(grouped));
    } catch (err) {
      console.error("โหลด loss-stats error:", err);
    }
  };

  useEffect(() => {
    fetchBorrowStats();
    fetchLossStats();
  }, [selectedFaculty, selectedMonth]);

  return (
    <ConfigProvider locale={thTH}>
      <div className="dashboard-container">
        <h1 className="dashboard-title">📊 Dashboard การใช้จักรยาน</h1>

        {/* 🔽 Filter */}
        <div className="dashboard-filters">
          <div>
            <label>เลือกคณะ: </label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>เลือกเดือน: </label>
            <DatePicker
              picker="month"
              placeholder="เลือกเดือน"
              onChange={(val) => {
                if (val) {
                  setSelectedMonth(val.format("YYYY-MM"));
                } else {
                  setSelectedMonth("");
                }
              }}
              format={(val) =>
                `${val.locale("th").format("MMMM")} ${val.year() + 543}`
              }
              style={{ width: 180, borderRadius: 8 }}
            />
          </div>
        </div>

        {/* 📊 Borrow Chart */}
        <section className="chart-section">
          <h2>🚲 สถิติการยืมจักรยานตามคณะ</h2>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={borrowData} barCategoryGap="20%">
                <XAxis
                  dataKey="faculty"
                  interval={0}
                  tick={{
                    fontSize: 12,
                    textAnchor: "middle",
                  }}
                  tickFormatter={(label) =>
                    label.length > 10 ? label.replace("และ", "\nและ") : label
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="อยู่ระหว่างการตรวจสอบ" fill="#ffcc00" barSize={30} />
                <Bar dataKey="อนุมัติ" fill="#4caf50" barSize={30} />
                <Bar dataKey="คืนแล้ว" fill="#2196f3" barSize={30} />
                <Bar dataKey="ยกเลิก" fill="#f44336" barSize={30} />
                <Bar dataKey="แจ้งหาย" fill="#9c27b0" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 🚨 Loss Chart */}
        <section className="chart-section">
          <h2>🚨 สถิติการแจ้งหายและการชำระเงิน</h2>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={lossData} barCategoryGap="20%">
                <XAxis
                  dataKey="faculty"
                  interval={0}
                  tick={{
                    fontSize: 12,
                    textAnchor: "middle",
                  }}
                  tickFormatter={(label) =>
                    label.length > 10 ? label.replace("และ", "\nและ") : label
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="รอตรวจสอบการแจ้งหาย" fill="#ff9800" barSize={18} />
                <Bar dataKey="ไม่อนุมัติการแจ้งหาย" fill="#e53935" barSize={18} />
                <Bar dataKey="รอการชำระเงิน" fill="#fbc02d" barSize={18} />
                <Bar dataKey="รอตรวจสอบการชำระเงิน" fill="#03a9f4" barSize={18} />
                <Bar dataKey="อนุมัติการชำระเงิน" fill="#4caf50" barSize={18} />
                <Bar dataKey="ชำระเงินไม่ถูกต้อง" fill="#9c27b0" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </ConfigProvider>
  );
}
