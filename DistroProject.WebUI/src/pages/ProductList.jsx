import React, { useEffect, useState } from 'react';
import { Row, Col, Empty, Spin, Typography } from 'antd';
import { getProducts, getCategories } from '../api/productService';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import './ProductList.css';

const { Title } = Typography;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 600]);
    const [maxPrice, setMaxPrice] = useState(600);

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

            // Calculate max price from the data
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
            // Map to unique category names for Checkbox.Group options
            const categoryNames = [...new Set(data.map(c => c.name))];
            setCategories(categoryNames);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const filterProducts = () => {
        let tempProducts = [...products];

        // Filter by Category — product.categories is an array of { id, name }
        if (selectedCategories.length > 0) {
            tempProducts = tempProducts.filter(p => {
                if (!p.categories || p.categories.length === 0) return false;
                // Check if any of the product's categories match the selected ones
                return p.categories.some(cat => selectedCategories.includes(cat.name));
            });
        }

        // Filter by Price
        tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        setFilteredProducts(tempProducts);
    };

    const handleCategoryChange = (checkedValues) => {
        setSelectedCategories(checkedValues);
    };

    const handlePriceChange = (value) => {
        setPriceRange(value);
    };

    return (
        <div className="product-page-container">
            <Row gutter={[24, 24]}>
                {/* Sidebar - Desktop: 6, Mobile: 24 */}
                <Col xs={24} md={6}>
                    <FilterSidebar
                        categories={categories}
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryChange}
                        priceRange={priceRange}
                        onPriceChange={handlePriceChange}
                        maxPrice={maxPrice}
                    />
                </Col>

                {/* Product Grid - Desktop: 18, Mobile: 24 */}
                <Col xs={24} md={18}>
                    <Title level={2} style={{ marginTop: 0, marginBottom: '24px', color: '#ffffff' }}>Ürünler</Title>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <Row gutter={[16, 24]}>
                            {filteredProducts.map(product => (
                                <Col xs={12} sm={12} md={12} lg={8} key={product.id}>
                                    <ProductCard product={product} />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="Aradığınız kriterlere uygun ürün bulunamadı." />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default ProductList;

