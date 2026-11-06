import React, { useState } from 'react';
import { Region } from '../types/sinkron';
import { MapPin, Table as TableIcon, Info, Users, Briefcase, GraduationCap } from 'lucide-react';

interface BantenMapProps {
  regions: Region[];
  selectedRegionId?: string | null;
  onSelectRegion?: (regionId: string) => void;
  metricType?: 'tpt' | 'absorption' | 'openJobs' | 'companies';
}

export const BantenMap: React.FC<BantenMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  metricType = 'absorption',
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);

  const getRegionColor = (region: Region) => {
    const isSelected = selectedRegionId === region.id;
    if (isSelected) return '#1F5FA8'; // Deep official blue

    if (metricType === 'absorption') {
      if (region.graduateAbsorptionRate >= 72) return '#2563EB';
      if (region.graduateAbsorptionRate >= 65) return '#60A5FA';
      return '#93C5FD';
    } else if (metricType === 'tpt') {
      if (region.tpt > 8.0) return '#F87171'; // Higher unemployment
      if (region.tpt > 7.0) return '#FCD34D';
      return '#86EFAC';
    } else {
      return '#60A5FA';
    }
  };

  const getMetricLabel = () => {
    switch (metricType) {
      case 'absorption':
        return 'Penyerapan Lulusan 6 Bulan (%)';
      case 'tpt':
        return 'Tingkat Pengangguran Terbuka (%)';
      case 'openJobs':
        return 'Lowongan & Magang Tersedia';
      case 'companies':
        return 'Industri Aktif';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">Peta Geospasial Vokasi &amp; Industri Banten</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indikator aktif: <strong className="text-slate-800">{getMetricLabel()}</strong> per Kabupaten/Kota.
          </p>
        </div>

        {/* View Switcher for Accessibility WCAG AA */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-semibold text-slate-700">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded transition ${viewMode === 'map' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tampilan Visual Peta
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabel Aksesibel
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
          {/* SVG Map Layout of Banten Provinces 8 Kab/Kota */}
          <div className="lg:col-span-8 bg-slate-50 rounded-lg p-4 border border-slate-200 relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
            <svg
              viewBox="0 0 800 480"
              className="w-full h-auto max-h-[380px]"
              aria-label="Peta Interaktif Provinsi Banten"
            >
              <defs>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Water background subtle styling */}
              <rect x="0" y="0" width="800" height="480" fill="#F0F7FF" rx="6" />
              <text x="50" y="40" fill="#94A3B8" fontSize="11" fontWeight="600" letterSpacing="2">
                LAUT JAWA
              </text>
              <text x="40" y="440" fill="#94A3B8" fontSize="11" fontWeight="600" letterSpacing="2">
                SAMUDRA HINDIA
              </text>
              <text x="25" y="240" fill="#94A3B8" fontSize="11" fontWeight="600" letterSpacing="2">
                SELAT SUNDA
              </text>

              {/* 1. Kota Cilegon (North West coastal industrial hub) */}
              <path
                d="M 120 110 L 170 95 L 185 140 L 145 165 L 110 145 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'cilegon')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('cilegon')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'cilegon') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="142" y="132" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Cilegon
              </text>

              {/* 2. Kota Serang (Capital city enclosed in Serang) */}
              <circle
                cx="245"
                cy="145"
                r="22"
                fill={getRegionColor(regions.find((r) => r.id === 'kota_serang')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('kota_serang')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'kota_serang') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="245" y="148" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Kota Serang
              </text>

              {/* 3. Kab Serang (Surrounds Kota Serang and Cilegon) */}
              <path
                d="M 170 95 L 290 85 L 340 120 L 320 200 L 260 215 L 185 185 L 185 140 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'kab_serang')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('kab_serang')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'kab_serang') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="250" y="105" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Kab. Serang
              </text>

              {/* 4. Kab Tangerang (North East industrial manufacturing hub) */}
              <path
                d="M 340 120 L 460 70 L 520 110 L 490 190 L 410 205 L 340 190 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'kab_tangerang')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('kab_tangerang')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'kab_tangerang') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="430" y="135" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Kab. Tangerang
              </text>

              {/* 5. Kota Tangerang */}
              <path
                d="M 520 110 L 590 115 L 585 170 L 515 165 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'kota_tangerang')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('kota_tangerang')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'kota_tangerang') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="555" y="142" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Kota Tgr
              </text>

              {/* 6. Kota Tangerang Selatan (Tangsel) */}
              <path
                d="M 515 165 L 585 170 L 580 225 L 505 215 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'tangsel')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('tangsel')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'tangsel') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="548" y="196" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Tangsel
              </text>

              {/* 7. Kab Pandeglang (South West) */}
              <path
                d="M 95 180 L 185 185 L 230 250 L 220 380 L 150 410 L 80 340 L 70 240 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'pandeglang')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('pandeglang')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'pandeglang') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="145" y="290" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Kab. Pandeglang
              </text>

              {/* 8. Kab Lebak (South East) */}
              <path
                d="M 230 250 L 320 200 L 410 205 L 505 215 L 490 350 L 380 420 L 230 400 Z"
                fill={getRegionColor(regions.find((r) => r.id === 'lebak')!)}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="url(#shadow)"
                className="cursor-pointer transition hover:opacity-85"
                onClick={() => onSelectRegion && onSelectRegion('lebak')}
                onMouseEnter={() => setHoveredRegion(regions.find((r) => r.id === 'lebak') || null)}
                onMouseLeave={() => setHoveredRegion(null)}
              />
              <text x="350" y="300" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                Kabupaten Lebak
              </text>
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded border border-slate-200 text-xs shadow-xs">
              <span className="font-semibold text-slate-800 block mb-1">Skala Penyerapan Kerja</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-blue-600 rounded-xs"></span>
                <span className="text-slate-600">&gt; 72%</span>
                <span className="w-3.5 h-3.5 bg-blue-400 rounded-xs ml-2"></span>
                <span className="text-slate-600">65 - 72%</span>
                <span className="w-3.5 h-3.5 bg-blue-300 rounded-xs ml-2"></span>
                <span className="text-slate-600">&lt; 65%</span>
              </div>
            </div>
          </div>

          {/* Region Detail Card */}
          <div className="lg:col-span-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
            {hoveredRegion || (selectedRegionId && regions.find((r) => r.id === selectedRegionId)) ? (
              (() => {
                const r = hoveredRegion || regions.find((reg) => reg.id === selectedRegionId)!;
                return (
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          Kode {r.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">{r.name}</h4>
                      </div>
                      <span className="text-xs text-slate-500 capitalize">{r.level}</span>
                    </div>

                    <div className="space-y-3 mt-3 text-xs">
                      <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          Penyerapan 6 Bulan
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{r.graduateAbsorptionRate}%</span>
                      </div>

                      <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-500" />
                          Pengangguran (TPT)
                        </span>
                        <span className={`font-bold text-sm ${r.tpt > 8 ? 'text-amber-700' : 'text-slate-800'}`}>
                          {r.tpt}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          Lowongan / Magang
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{r.openJobSlots} posisi</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block">Industri Terdaftar</span>
                          <span className="font-bold text-slate-800">{r.activeCompanies} PT</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 block">SMK Vokasi</span>
                          <span className="font-bold text-slate-800">{r.vocationalSchools} Sekolah</span>
                        </div>
                      </div>
                    </div>

                    {onSelectRegion && (
                      <button
                        onClick={() => onSelectRegion(r.id)}
                        className="w-full mt-4 text-xs font-semibold py-2 px-3 bg-blue-800 hover:bg-blue-900 text-white rounded transition"
                      >
                        Filter Data SINKRON untuk {r.name}
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">Arahkan kursor atau klik wilayah pada peta</p>
                <p className="text-slate-400 mt-1">
                  Untuk memeriksa data serapan vokasi, industri aktif, dan peluang lowongan di 8 Kabupaten/Kota Provinsi Banten.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Accessible Table Alternative as required by WCAG AA & Spec P1 */
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                <th className="py-2.5 px-3">Kode BPS</th>
                <th className="py-2.5 px-3">Kabupaten / Kota</th>
                <th className="py-2.5 px-3 text-right">Penyerapan Lulusan (%)</th>
                <th className="py-2.5 px-3 text-right">TPT BPS (%)</th>
                <th className="py-2.5 px-3 text-right">Industri Terdaftar</th>
                <th className="py-2.5 px-3 text-right">SMK Vokasi</th>
                <th className="py-2.5 px-3 text-right">Lowongan Aktif</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {regions.map((reg) => (
                <tr
                  key={reg.id}
                  className={`hover:bg-blue-50 transition ${selectedRegionId === reg.id ? 'bg-blue-50/80 font-medium' : ''}`}
                >
                  <td className="py-2 px-3 text-slate-500 font-mono">{reg.code}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{reg.name}</td>
                  <td className="py-2 px-3 text-right font-bold text-blue-900">{reg.graduateAbsorptionRate}%</td>
                  <td className="py-2 px-3 text-right">{reg.tpt}%</td>
                  <td className="py-2 px-3 text-right">{reg.activeCompanies}</td>
                  <td className="py-2 px-3 text-right">{reg.vocationalSchools}</td>
                  <td className="py-2 px-3 text-right text-emerald-700 font-semibold">{reg.openJobSlots}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => onSelectRegion && onSelectRegion(reg.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 text-blue-800"
                    >
                      Pilih Wilayah
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
