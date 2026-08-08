import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, LuckyDraw } from '../types';
import { maskMobile } from '../context/AuthContext';
import { Download, Search, FileSpreadsheet, FileText, RefreshCw, User, Layers, Trophy } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface LuckyDrawSpreadsheetProps {
  tickets: Ticket[];
  draws: LuckyDraw[];
  selectedDraw?: LuckyDraw | null;
  isAdmin?: boolean;
  currentUserUid?: string;
  onRefresh?: () => void;
  onDeclareWinner?: (drawId: string) => void;
}

export const LuckyDrawSpreadsheet: React.FC<LuckyDrawSpreadsheetProps> = ({
  tickets,
  draws,
  selectedDraw: initialSelectedDraw,
  isAdmin = false,
  currentUserUid,
  onRefresh,
  onDeclareWinner
}) => {
  const [selectedDrawId, setSelectedDrawId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMyTickets, setShowOnlyMyTickets] = useState(false);

  // Sync selectedDrawId when initialSelectedDraw changes
  useEffect(() => {
    if (initialSelectedDraw) {
      setSelectedDrawId(initialSelectedDraw.id);
    } else if (draws.length > 0 && !selectedDrawId) {
      setSelectedDrawId(draws[0].id);
    }
  }, [initialSelectedDraw, draws]);

  // Active draw object
  const activeDraw = useMemo(() => {
    if (selectedDrawId) {
      const found = draws.find((d) => d.id === selectedDrawId);
      if (found) return found;
    }
    if (initialSelectedDraw) return initialSelectedDraw;
    return draws.length > 0 ? draws[0] : null;
  }, [selectedDrawId, initialSelectedDraw, draws]);

  // Filter tickets strictly for the active draw
  const drawTickets = useMemo(() => {
    if (!activeDraw) return [];
    return tickets.filter((t) => t.drawId === activeDraw.id);
  }, [tickets, activeDraw]);

  // Process rows with strictly 4 columns: Serial Number, Ticket Number, User Name, Mobile Number
  const processedRows = useMemo(() => {
    const sorted = [...drawTickets].sort((a, b) => a.ticketNumber - b.ticketNumber);

    return sorted.map((t, index) => {
      const rawName = t.userName || 'Participant';
      const rawMobile = t.userMobile || '9876543210';
      const ticketNumStr = `#${String(t.ticketNumber).padStart(3, '0')}`;

      // Ticket Number visible to everyone
      const displayedTicketNumber = ticketNumStr;

      // Mobile Number masked for users (98XXXXXX45), full for admin
      const displayedMobile = isAdmin ? rawMobile : (t.userMobileMasked || maskMobile(rawMobile));

      return {
        serialNumber: index + 1,
        ticketId: t.id,
        userUid: t.userUid,
        rawTicketNumber: t.ticketNumber,
        displayedTicketNumber,
        userName: rawName,
        displayedMobile,
        rawMobile
      };
    });
  }, [drawTickets, isAdmin]);

  // Search & My Tickets filtering
  const filteredRows = useMemo(() => {
    return processedRows.filter((r) => {
      if (showOnlyMyTickets && currentUserUid && r.userUid !== currentUserUid) {
        return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchSerial = String(r.serialNumber).includes(term);
        const matchTicket = r.displayedTicketNumber.toLowerCase().includes(term) || String(r.rawTicketNumber).includes(term);
        const matchName = r.userName.toLowerCase().includes(term);
        const matchMobile = r.displayedMobile.includes(term) || r.rawMobile.includes(term);

        if (!matchSerial && !matchTicket && !matchName && !matchMobile) {
          return false;
        }
      }

      return true;
    });
  }, [processedRows, showOnlyMyTickets, currentUserUid, searchTerm]);

  // Export Excel (.xlsx) with exact 4 columns
  const exportToExcel = () => {
    if (!activeDraw) return;

    const excelData = filteredRows.map((r) => ({
      'Serial Number': r.serialNumber,
      'Ticket Number': r.displayedTicketNumber,
      'User Name': r.userName,
      'Mobile Number': r.displayedMobile
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for exact 4 columns
    worksheet['!cols'] = [
      { wch: 15 }, // Serial Number
      { wch: 18 }, // Ticket Number
      { wch: 28 }, // User Name
      { wch: 22 }  // Mobile Number
    ];

    const workbook = XLSX.utils.book_new();
    const sheetName = activeDraw.title.slice(0, 30).replace(/[:\\/?*\[\]]/g, '_');
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Lucky_Draw');

    const viewPrefix = isAdmin ? 'Admin_Full' : 'User_Public';
    const drawCleanTitle = activeDraw.title.replace(/\s+/g, '_');
    XLSX.writeFile(workbook, `${drawCleanTitle}_${viewPrefix}_Spreadsheet.xlsx`);
  };

  // Export PDF (.pdf) with exact 4 columns
  const exportToPDF = () => {
    if (!activeDraw) return;

    const pdfDoc = new jsPDF('portrait');

    // Excel Green Title Ribbon
    pdfDoc.setFillColor(20, 83, 45); // Excel Green
    pdfDoc.rect(0, 0, 210, 28, 'F');

    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(13);
    pdfDoc.text(`${activeDraw.title.toUpperCase()} - TICKET SPREADSHEET`, 14, 15);

    pdfDoc.setFontSize(9);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.text(
      `Mode: ${isAdmin ? 'Admin (Unmasked Mobile)' : 'Public User (Masked Mobile)'}  |  Total Tickets: ${filteredRows.length}`,
      14,
      22
    );

    // Table Header (4 columns)
    const startY = 35;
    pdfDoc.setFillColor(30, 41, 59); // slate-800
    pdfDoc.rect(14, startY, 182, 10, 'F');

    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(9);

    pdfDoc.text('SERIAL NUMBER', 18, startY + 7);
    pdfDoc.text('TICKET NUMBER', 58, startY + 7);
    pdfDoc.text('USER NAME', 105, startY + 7);
    pdfDoc.text('MOBILE NUMBER', 152, startY + 7);

    let currentY = startY + 11;
    pdfDoc.setFont('helvetica', 'normal');

    filteredRows.forEach((r, idx) => {
      if (currentY > 270) {
        pdfDoc.addPage('portrait');
        currentY = 20;
      }

      // Alternating row styling
      if (idx % 2 === 1) {
        pdfDoc.setFillColor(241, 245, 249);
        pdfDoc.rect(14, currentY - 4, 182, 7, 'F');
      }

      pdfDoc.setTextColor(15, 23, 42);
      pdfDoc.text(String(r.serialNumber), 18, currentY);
      pdfDoc.text(r.displayedTicketNumber, 58, currentY);
      pdfDoc.text(r.userName.slice(0, 24), 105, currentY);
      pdfDoc.text(r.displayedMobile, 152, currentY);

      currentY += 7;
    });

    const pageCount = (pdfDoc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdfDoc.setPage(i);
      pdfDoc.setFontSize(8);
      pdfDoc.setTextColor(100, 116, 139);
      pdfDoc.text(`1X Luck Ticket Spreadsheet • ${activeDraw.title} • Page ${i} of ${pageCount}`, 14, 287);
    }

    const viewPrefix = isAdmin ? 'Admin_Full' : 'User_Public';
    const drawCleanTitle = activeDraw.title.replace(/\s+/g, '_');
    pdfDoc.save(`${drawCleanTitle}_${viewPrefix}_Spreadsheet.pdf`);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans">
      {/* Excel Sheet Title Header Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 px-4 py-3 border-b border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl shadow-inner">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase font-mono">
                {activeDraw ? `${activeDraw.title} Spreadsheet` : 'LUCKY DRAW TICKET SPREADSHEET'}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isAdmin ? 'ADMIN UNMASKED' : 'USER MASKED'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-mono">
              Excel-style ticket ledger • {filteredRows.length} tickets recorded for this draw
            </p>
          </div>
        </div>

        {/* Export Toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-mono transition flex items-center gap-1 cursor-pointer"
              title="Refresh sheet data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={exportToExcel}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportToPDF}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold rounded-lg text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Control Ribbon */}
      <div className="bg-slate-800/90 border-b border-slate-700 p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isAdmin ? "Search name, mobile, ticket #..." : "Search name, ticket #..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* My Tickets Toggle */}
          {currentUserUid && (
            <button
              onClick={() => setShowOnlyMyTickets(!showOnlyMyTickets)}
              className={`px-3 py-2 rounded-xl border font-mono font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showOnlyMyTickets
                  ? 'bg-orange-600 text-white border-orange-500 shadow'
                  : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Tickets</span>
            </button>
          )}

          {/* Admin Random Winner Selection Action */}
          {isAdmin && activeDraw?.status === 'active' && onDeclareWinner && (
            <button
              onClick={() => onDeclareWinner(activeDraw.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>🎲 Draw Random Winner</span>
            </button>
          )}

        </div>

        {/* Excel Grid Header Letter Markers (A, B, C, D) */}
        <div className="grid grid-cols-12 gap-0 bg-slate-950 border border-slate-800 text-[10px] font-mono text-center font-bold text-slate-400 rounded-lg overflow-hidden py-1">
          <div className="col-span-2 border-r border-slate-800 text-emerald-400">COL A</div>
          <div className="col-span-3 border-r border-slate-800 text-emerald-400">COL B</div>
          <div className="col-span-4 border-r border-slate-800 text-emerald-400">COL C</div>
          <div className="col-span-3 text-emerald-400">COL D</div>
        </div>
      </div>

      {/* Main Excel-style Continuous 4-Column Spreadsheet Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[480px] sm:max-h-[560px] border border-slate-800 rounded-b-xl shadow-inner">
        <table className="w-full text-left border-collapse font-mono text-[11px] text-slate-200">
          <thead>
            <tr className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-700 sticky top-0 z-20 shadow">
              <th className="py-2.5 px-3 border-r border-slate-700 text-center w-20 bg-slate-850">
                S.No
              </th>
              <th className="py-2.5 px-3 border-r border-slate-700 text-left w-28">
                Ticket #
              </th>
              <th className="py-2.5 px-3 border-r border-slate-700 text-left">
                User Name
              </th>
              <th className="py-2.5 px-3 text-left w-36">
                Mobile #
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 font-mono text-xs">
                  {activeDraw 
                    ? `No tickets purchased yet for ${activeDraw.title}.`
                    : 'No matching ticket records found.'}
                </td>
              </tr>
            ) : (
              filteredRows.map((r, index) => {
                const isMine = currentUserUid && r.userUid === currentUserUid;

                return (
                  <tr
                    key={r.ticketId}
                    className={`hover:bg-slate-800/80 transition-colors ${
                      isMine
                        ? 'bg-amber-500/15 hover:bg-amber-500/25 border-l-2 border-l-amber-400'
                        : index % 2 === 1
                        ? 'bg-slate-950/40'
                        : ''
                    }`}
                  >
                    {/* Column 1: Serial Number */}
                    <td className="py-2 px-3 border-r border-slate-800 text-center font-bold text-slate-400 bg-slate-950/60">
                      {r.serialNumber}
                    </td>

                    {/* Column 2: Ticket Number */}
                    <td className="py-2 px-3 border-r border-slate-800 font-bold text-amber-300 whitespace-nowrap">
                      {r.displayedTicketNumber}
                    </td>

                    {/* Column 3: User Name */}
                    <td className="py-2 px-3 border-r border-slate-800 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[160px]">{r.userName}</span>
                        {isMine && !isAdmin && (
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase shrink-0">YOU</span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Mobile Number */}
                    <td className="py-2 px-3 text-slate-300 font-mono whitespace-nowrap">
                      <div className="flex items-center justify-between gap-2">
                        <span>{r.displayedMobile}</span>
                        {activeDraw?.winnerTicketNumber === r.rawTicketNumber && (
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] font-mono rounded shadow flex items-center gap-0.5 shrink-0">
                            <Trophy className="w-2.5 h-2.5 text-slate-950" />
                            <span>WINNER</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Status Footer */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Active Sheet: <strong className="text-white">{activeDraw?.title || 'N/A'}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Total Recorded Rows: <strong className="text-emerald-400">{filteredRows.length}</strong></span>
        </div>
      </div>
    </div>
  );
};
