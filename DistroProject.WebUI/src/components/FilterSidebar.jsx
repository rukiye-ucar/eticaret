import React from 'react';
import { Checkbox, Slider, Button, Typography } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import '../pages/ProductList.css';

const { Text } = Typography;

const FilterSidebar = ({
    categories,
    selectedCategories,
    onCategoryChange,
    priceRange,
    onPriceChange,
    maxPrice,
    onClearFilters,
    hasActiveFilters,
    mobileMode = false,
}) => {
    return (
        <div className={`filter-sidebar ${mobileMode ? 'filter-sidebar-mobile' : ''}`}>

            {/* ── Categories ── */}
            <div className="filter-section">
                <div className="filter-title">Kategoriler</div>
                {categories.length > 0 ? (
                    <Checkbox.Group
                        options={categories}
                        value={selectedCategories}
                        onChange={onCategoryChange}
                        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    />
                ) : (
                    <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
                        Kategori bulunamadı
                    </Text>
                )}
            </div>

            {/* ── Price Range ── */}
            <div className="filter-section">
                <div className="filter-title">Fiyat Aralığı</div>
                <Slider
                    range
                    min={0}
                    max={maxPrice || 1000}
                    value={priceRange}
                    onChange={onPriceChange}
                    trackStyle={[{ backgroundColor: '#f9b17a', height: 4 }]}
                    railStyle={{ backgroundColor: 'rgba(255,255,255,0.15)', height: 4 }}
                    handleStyle={[
                        { borderColor: '#f9b17a', backgroundColor: '#f9b17a', width: 16, height: 16, marginTop: -6 },
                        { borderColor: '#f9b17a', backgroundColor: '#f9b17a', width: 16, height: 16, marginTop: -6 }
                    ]}
                />
                <div className="price-range-values">
                    <span className="price-badge">{priceRange[0]} TL</span>
                    <span className="price-badge">{priceRange[1]} TL</span>
                </div>
            </div>

            {/* ── Clear Filters ── */}
            {hasActiveFilters && (
                <Button
                    className="clear-filters-btn"
                    icon={<ClearOutlined />}
                    onClick={onClearFilters}
                >
                    Filtreleri Temizle
                </Button>
            )}
        </div>
    );
};

export default FilterSidebar;
