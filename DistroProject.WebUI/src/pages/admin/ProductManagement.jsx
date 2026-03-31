import { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Upload, message, Card, Popconfirm, Image, Tag } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`);
            if (response.ok) {
                setProducts(await response.json());
            } else {
                message.error('Failed to load products.');
            }
        } catch {
            message.error('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`);
            if (response.ok) setCategories(await response.json());
        } catch { console.error('Error fetching categories'); }
    };

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    const handleAddClick = () => { setEditingProduct(null); form.resetFields(); setIsModalVisible(true); };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        form.setFieldsValue({
            name: product.name,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            unitType: product.unitType,
            categoryIds: product.categories?.map(c => c.id) || [],
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                message.success('Product deleted successfully.');
                fetchProducts();
            } else {
                const errorText = await response.text();
                message.error(`Delete failed: ${errorText}`);
            }
        } catch {
            message.error('An error occurred.');
        }
    };

    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('Name', values.name);
        formData.append('Price', values.price);
        formData.append('Cost', values.cost ?? 0);
        formData.append('UnitType', values.unitType);
        formData.append('Stock', values.stock);
        if (values.categoryIds) values.categoryIds.forEach(id => formData.append('CategoryIds', id));
        if (values.image?.fileList?.length > 0) formData.append('ImageFile', values.image.fileList[0].originFileObj);

        const url = editingProduct
            ? `${import.meta.env.VITE_API_BASE_URL}/products/${editingProduct.id}`
            : `${import.meta.env.VITE_API_BASE_URL}/products`;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (response.ok) {
                message.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
                setIsModalVisible(false);
                form.resetFields();
                fetchProducts();
            } else {
                const errorText = await response.text();
                message.error(`Operation failed: ${errorText}`);
            }
        } catch {
            message.error('An error occurred.');
        }
    };

    return (
        <div>
            <Card
                title="Product Management"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
                        Add Product
                    </Button>
                }
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>No products found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {products.map(product => (
                            <div key={product.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', borderRadius: 10, background: '#fafafa',
                                border: '1px solid #e8e8e8', flexWrap: 'wrap'
                            }}>
                                {/* Image */}
                                <div style={{ flexShrink: 0 }}>
                                    {product.image ? (
                                        <Image src={`data:image/jpeg;base64,${product.image}`} width={56} height={56} style={{ objectFit: 'cover', borderRadius: 8 }} />
                                    ) : (
                                        <div style={{ width: 56, height: 56, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '0.75rem' }}>No Img</div>
                                    )}
                                </div>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 140 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.name}</div>
                                    <div style={{ color: '#888', fontSize: '0.82rem' }}>Stock: {product.stock} · {product.unitType}</div>
                                    <div style={{ marginTop: 4 }}>
                                        {product.categories?.map(cat => <Tag key={cat.id} color="blue">{cat.name}</Tag>)}
                                    </div>
                                </div>
                                {/* Price + Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                        <span style={{ fontWeight: 700, color: '#d97b3a', fontSize: '1rem' }}>
                                            Satış: ${product.price}
                                        </span>
                                        {product.cost > 0 && (
                                            <span style={{ fontSize: '0.78rem', color: '#888' }}>
                                                Alış: ${product.cost}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Button icon={<EditOutlined />} size="small" onClick={() => handleEditClick(product)}>Edit</Button>
                                        <Popconfirm
                                            title="Delete Product"
                                            description="Are you sure you want to delete this product?"
                                            onConfirm={() => handleDelete(product.id)}
                                            okText="Yes, Delete"
                                            cancelText="Cancel"
                                        >
                                            <Button danger icon={<DeleteOutlined />} size="small">Delete</Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ unitType: 'Piece' }}>
                    <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please enter product name' }]}>
                        <Input placeholder="Enter product name" />
                    </Form.Item>
                    <Form.Item name="price" label="Satış Fiyatı (Price)" rules={[{ required: true, message: 'Please enter price' }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="cost" label="Alış Fiyatı (Cost)" rules={[{ required: false }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item name="categoryIds" label="Categories" rules={[{ required: true, message: 'Please select at least one category' }]}>
                        <Select mode="multiple" placeholder="Select categories">
                            {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="unitType" label="Unit Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Piece">Piece</Option>
                            <Option value="Kg">Kilogram (Kg)</Option>
                            <Option value="Liter">Liter</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true, message: 'Please enter stock quantity' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="image" label="Product Image" extra={editingProduct && 'Existing image will be kept if no new file is uploaded.'}>
                        <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Image</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;
