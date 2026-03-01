import React, { useEffect, useState } from 'react';
import { Empty, Spin, Drawer, Button } from 'antd';
import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import { getProducts, getCategories } from '../api/productService';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    // Filter states
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 600]);
    const [maxPrice, setMaxPrice] = useState(600);

    const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [selectedCategories, priceRange, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
            if (data.length > 0) {
                const max = Math.max(...data.map(p => p.price), 600);
                setMaxPrice(max > 600 ? max : 600);
                setPriceRange([0, max > 600 ? max : 600]);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            const categoryNames = [...new Set(data.map(c => c.name))];
            setCategories(categoryNames);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const filterProducts = () => {
        let temp = [...products];
        if (selectedCategories.length > 0) {
            temp = temp.filter(p =>
                p.categories?.some(cat => selectedCategories.includes(cat.name))
            );
        }
        temp = temp.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
        setFilteredProducts(temp);
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setPriceRange([0, maxPrice]);
    };

    const filterSidebarProps = {
        categories,
        selectedCategories,
        onCategoryChange: setSelectedCategories,
        priceRange,
        onPriceChange: setPriceRange,
        maxPrice,
        onClearFilters: handleClearFilters,
        hasActiveFilters,
    };

    return (
        <div className="product-page-container">

            {/* ── Mobile Filter Button ── */}
            <Button
                className="filter-toggle-btn"
                onClick={() => setFilterDrawerOpen(true)}
                icon={<FilterOutlined />}
            >
                Filters{hasActiveFilters ? ` (${selectedCategories.length > 0 ? selectedCategories.length : ''}${selectedCategories.length > 0 && priceRange[0] > 0 || priceRange[1] < maxPrice ? '+' : ''} active)` : ''}
            </Button>

            <div className="products-layout">
                {/* ── Desktop Filter Sidebar ── */}
                <div className="filter-sidebar-desktop">
                    <FilterSidebar {...filterSidebarProps} />
                </div>

                {/* ── Products Column ── */}
                <div>
                    {/* Header Row */}
                    <div className="products-header-row">
                        <h2 className="products-title">Products</h2>
                        {!loading && (
                            <span className="products-count">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                            </span>
                        )}
                    </div>

                    {/* Grid */}
                    <div className="products-grid">
                        {loading ? (
                            <div className="products-loading">
                                <Spin size="large" />
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="products-empty">
                                <span className="products-empty-icon">🔍</span>
                                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
                                    No products found
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>
                                    Try adjusting your filters
                                </span>
                                {hasActiveFilters && (
                                    <Button
                                        type="link"
                                        onClick={handleClearFilters}
                                        style={{ color: '#f9b17a', marginTop: '4px' }}
                                    >
                                        Clear all filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile Filter Drawer ── */}
            <Drawer
                title={
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                        <FilterOutlined style={{ marginRight: 8, color: '#f9b17a' }} />
                        Filters
                    </span>
                }
                placement="left"
                onClose={() => setFilterDrawerOpen(false)}
                open={filterDrawerOpen}
                width={300}
                styles={{
                    header: { background: '#1a1040', borderBottom: '1px solid rgba(249,177,122,0.15)' },
                    body: { background: '#1a1040', padding: '16px' },
                    footer: { background: '#1a1040', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' },
                    mask: { backdropFilter: 'blur(4px)' }
                }}
                closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
                footer={
                    <Button
                        type="primary"
                        block
                        onClick={() => setFilterDrawerOpen(false)}
                        style={{
                            background: 'linear-gradient(135deg, #f9b17a, #f4934a)',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            height: '44px',
                            color: '#1a0f36'
                        }}
                    >
                        Show {filteredProducts.length} Results
                    </Button>
                }
            >
                <FilterSidebar {...filterSidebarProps} mobileMode />
            </Drawer>
        </div>
    );
};

export default ProductList;
