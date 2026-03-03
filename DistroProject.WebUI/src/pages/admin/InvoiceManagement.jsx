import { useState, useEffect, useMemo } from 'react';
import { Button, Spin, Input, Empty, Tooltip } from 'antd';
import { FilePdfOutlined, DownloadOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoSrc from '../../assets/non-back.png';
import './InvoiceManagement.css';

const COMPANY_NAME = 'Albatros';

// ── Helpers ──────────────────────────────────────────────────
const toBase64 = (url) =>
    new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });

const getImageDataUrl = (imageData, contentType) => {
    if (!imageData) return null;
    if (typeof imageData === 'string' && imageData.startsWith('http')) return imageData;
    if (typeof imageData === 'string' && imageData.startsWith('data:')) return imageData;
    return `data:${contentType || 'image/png'};base64,${imageData}`;
};

// Group key: customerId + date truncated to minute (same shopping session)
const sessionKey = (order) => {
    const d = new Date(order.orderDate);
    return `${order.customerId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${d.getHours()}-${d.getMinutes()}`;
};

// ── PDF Generator ─────────────────────────────────────────────
const generateGroupPDF = async (group, logoB64, action = 'download') => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header: Logo + Company name ──────────────────────────
    if (logoB64) {
        try { doc.addImage(logoB64, 'PNG', pageW / 2 - 15, 10, 30, 30); } catch (_) { }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(45, 34, 80);
    doc.text(COMPANY_NAME, pageW / 2, 46, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(249, 177, 122);
    doc.text('INVOICE', pageW / 2, 54, { align: 'center' });

    doc.setDrawColor(249, 177, 122);
    doc.setLineWidth(0.5);
    doc.line(14, 57, pageW - 14, 57);

    // ── Invoice Meta ─────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const firstOrder = group.orders[0];
    const leftX = 14;
    const rightX = pageW - 14;
    let y = 65;

    const metaLeft = [
        ['Invoice No:', `#${group.invoiceNo}`],
        ['Customer:', group.customerName],
    ];
    const metaRight = [
        ['Date:', new Date(firstOrder.orderDate).toLocaleDateString('en-GB')],
        ['Time:', new Date(firstOrder.orderDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })],
    ];

    metaLeft.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold'); doc.text(label, leftX, y);
        doc.setFont('helvetica', 'normal'); doc.text(value, leftX + 28, y);
        y += 7;
    });

    y = 65;
    metaRight.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold'); doc.text(label, rightX - 60, y);
        doc.setFont('helvetica', 'normal'); doc.text(value, rightX - 40, y);
        y += 7;
    });

    y = 84;

    // ── Product Table ─────────────────────────────────────────
    // Preload all product images
    const imgMap = {};
    await Promise.all(
        group.orders.map(async (o, idx) => {
            const src = getImageDataUrl(o.product?.image, o.product?.imageContentType);
            if (src) {
                const b64 = await toBase64(src);
                if (b64) imgMap[idx] = b64;
            }
        })
    );

    const tableBody = group.orders.map((o, idx) => {
        const unitPrice = o.quantity > 0 ? (o.totalPrice / o.quantity).toFixed(2) : o.totalPrice;
        return [
            idx,                                                           // used for image injection (hidden)
            o.product?.name || `Product #${o.productId}`,
            `$${unitPrice}`,
            String(o.quantity),
            `$${o.totalPrice?.toFixed ? o.totalPrice.toFixed(2) : o.totalPrice}`,
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['', 'Product', 'Unit Price', 'Qty', 'Total']],
        body: tableBody,
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
        headStyles: {
            fillColor: [45, 34, 80],
            textColor: [249, 177, 122],
            fontStyle: 'bold',
        },
        bodyStyles: { textColor: [40, 40, 40], minCellHeight: 18 },
        alternateRowStyles: { fillColor: [250, 248, 255] },
        columnStyles: {
            0: { cellWidth: 18 },           // image col
            1: { cellWidth: 75 },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: 14, right: 14 },
        willDrawCell: (data) => {
            // Hide the index text in column 0
            if (data.section === 'body' && data.column.index === 0) {
                data.cell.text = [];
            }
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                const rowIdx = data.row.index;
                const b64 = imgMap[rowIdx];
                if (b64) {
                    try {
                        doc.addImage(b64, 'PNG',
                            data.cell.x + 1, data.cell.y + 1, 14, 14);
                    } catch (_) { }
                }
            }
        },
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Grand total
    const grandTotal = group.orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(45, 34, 80);
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, rightX, finalY, { align: 'right' });

    // ── Footer ────────────────────────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 18;
    doc.setDrawColor(249, 177, 122);
    doc.setLineWidth(0.3);
    doc.line(14, footerY - 4, pageW - 14, footerY - 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(
        `${COMPANY_NAME} — This document is auto-generated.`,
        pageW / 2, footerY, { align: 'center' }
    );

    const filename = `albatros-invoice-${group.invoiceNo}-${group.customerName}.pdf`;

    if (action === 'download') {
        doc.save(filename);
    } else {
        const blob = doc.output('blob');
        window.open(URL.createObjectURL(blob), '_blank');
    }
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const InvoiceManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [logoB64, setLogoB64] = useState(null);
    const [generatingKey, setGeneratingKey] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => { toBase64(logoSrc).then(setLogoB64); }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setOrders(await res.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchOrders();
    }, [token]);

    // Group orders by customer + shopping session (same minute)
    const invoiceGroups = useMemo(() => {
        const map = {};
        [...orders].sort((a, b) => b.id - a.id).forEach(order => {
            const key = sessionKey(order);
            if (!map[key]) {
                map[key] = {
                    key,
                    invoiceNo: order.id,   // highest ID in session = invoice number
                    customerId: order.customerId,
                    customerName: order.customer?.name || order.customer?.email || `Customer #${order.customerId}`,
                    sessionDate: order.orderDate,
                    orders: [],
                    grandTotal: 0,
                };
            }
            map[key].orders.push(order);
            map[key].grandTotal += order.totalPrice || 0;
            // Invoice no = highest order ID in the group
            if (order.id > map[key].invoiceNo) map[key].invoiceNo = order.id;
        });

        // Sort groups: newest first (highest invoiceNo)
        return Object.values(map).sort((a, b) => b.invoiceNo - a.invoiceNo);
    }, [orders]);

    // Filter
    const filteredGroups = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return invoiceGroups;
        return invoiceGroups.filter(g =>
            String(g.invoiceNo).includes(q) ||
            g.customerName.toLowerCase().includes(q) ||
            g.orders.some(o => (o.product?.name || '').toLowerCase().includes(q))
        );
    }, [invoiceGroups, search]);

    const handlePDF = async (group, action) => {
        const genKey = group.key + action;
        setGeneratingKey(genKey);
        await generateGroupPDF(group, logoB64, action);
        setGeneratingKey(null);
    };

    return (
        <div className="inv-page">
            {/* Page Header */}
            <div className="inv-header">
                <div className="inv-header-left">
                    <FileTextOutlined className="inv-header-icon" />
                    <div>
                        <h2 className="inv-title">Invoices</h2>
                        <p className="inv-subtitle">View or download PDF invoices for each purchase.</p>
                    </div>
                </div>
                <Input
                    className="inv-search"
                    placeholder="Invoice no, customer name, product..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>

            {loading ? (
                <div className="inv-spin-wrap"><Spin size="large" /></div>
            ) : filteredGroups.length === 0 ? (
                <Empty description="No invoices found." />
            ) : (
                <div className="inv-grid">
                    {filteredGroups.map((group) => (
                        <div key={group.key} className="inv-card">
                            {/* Card Header */}
                            <div className="inv-card-header">
                                <span className="inv-card-id">Invoice #{group.invoiceNo}</span>
                                <span className="inv-item-count">{group.orders.length} item(s)</span>
                            </div>

                            {/* Customer + Date */}
                            <div className="inv-card-meta">
                                <span className="inv-customer-name">{group.customerName}</span>
                                <span className="inv-date">
                                    {new Date(group.sessionDate).toLocaleDateString('en-GB')}{' '}
                                    {new Date(group.sessionDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Products list */}
                            <div className="inv-products-list">
                                {group.orders.map((order) => {
                                    const imgSrc = getImageDataUrl(order.product?.image, order.product?.imageContentType);
                                    const unitPrice = order.quantity > 0
                                        ? (order.totalPrice / order.quantity).toFixed(2)
                                        : order.totalPrice;
                                    return (
                                        <div key={order.id} className="inv-product-row">
                                            {imgSrc ? (
                                                <img src={imgSrc} alt={order.product?.name} className="inv-product-thumb" />
                                            ) : (
                                                <div className="inv-product-thumb inv-product-placeholder">?</div>
                                            )}
                                            <div className="inv-product-info">
                                                <span className="inv-product-name">
                                                    {order.product?.name || `Product #${order.productId}`}
                                                </span>
                                                <span className="inv-product-unit">
                                                    ${unitPrice} × {order.quantity}
                                                </span>
                                            </div>
                                            <span className="inv-row-total">
                                                ${order.totalPrice?.toFixed ? order.totalPrice.toFixed(2) : order.totalPrice}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Grand Total */}
                            <div className="inv-grand-total">
                                Total: <strong>${group.grandTotal.toFixed(2)}</strong>
                            </div>

                            {/* Actions */}
                            <div className="inv-actions">
                                <Tooltip title="View PDF in new tab">
                                    <Button
                                        icon={<FilePdfOutlined />}
                                        className="inv-btn-view"
                                        loading={generatingKey === group.key + 'view'}
                                        onClick={() => handlePDF(group, 'view')}
                                    >
                                        View
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Download as PDF">
                                    <Button
                                        icon={<DownloadOutlined />}
                                        className="inv-btn-dl"
                                        loading={generatingKey === group.key + 'download'}
                                        onClick={() => handlePDF(group, 'download')}
                                    >
                                        Download
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvoiceManagement;
