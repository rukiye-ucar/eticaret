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
                message.error('Ürünler yüklenemedi.');
            }
        } catch {
            message.error('Bir hata oluştu.');
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
                message.success('Ürün başarıyla silindi.');
                fetchProducts();
            } else {
                const errorText = await response.text();
                message.error(`Silme işlemi başarısız: ${errorText}`);
            }
        } catch {
            message.error('Bir hata oluştu.');
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
                message.success(`Ürün başarıyla ${editingProduct ? 'güncellendi' : 'eklendi'}!`);
                setIsModalVisible(false);
                form.resetFields();
                fetchProducts();
            } else {
                const errorText = await response.text();
                message.error(`İşlem başarısız: ${errorText}`);
            }
        } catch {
            message.error('Bir hata oluştu.');
        }
    };

    return (
        <div>
            <Card
                title="Ürün Yönetimi"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
                        Ürün Ekle
                    </Button>
                }
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>Yükleniyor...</div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>Ürün bulunamadı.</div>
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
                                        <div style={{ width: 56, height: 56, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '0.75rem' }}>Resim Yok</div>
                                    )}
                                </div>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 140 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.name}</div>
                                    <div style={{ color: '#888', fontSize: '0.82rem' }}>
                                        Stok: {product.stock} · {{ Piece: 'Adet', Kg: 'Kilogram (Kg)', Liter: 'Litre' }[product.unitType] || product.unitType}
                                        {product.stock === 0 && <Tag color="error" style={{ marginLeft: 8 }}>Stokta Yok</Tag>}
                                        {product.stock > 0 && product.stock <= 5 && <Tag color="warning" style={{ marginLeft: 8 }}>Az Stok</Tag>}
                                    </div>
                                    <div style={{ marginTop: 4 }}>
                                        {product.categories?.map(cat => <Tag key={cat.id} color="blue">{cat.name}</Tag>)}
                                    </div>
                                </div>
                                {/* Price + Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                        <span style={{ fontWeight: 700, color: '#d97b3a', fontSize: '1rem' }}>
                                            Fiyat: {product.price} TL
                                        </span>
                                        {product.cost > 0 && (
                                            <span style={{ fontSize: '0.78rem', color: '#888' }}>
                                                Maliyet: {product.cost} TL
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Button icon={<EditOutlined />} size="small" onClick={() => handleEditClick(product)}>Düzenle</Button>
                                        <Popconfirm
                                            title="Ürünü Sil"
                                            description="Bu ürünü silmek istediğinize emin misiniz?"
                                            onConfirm={() => handleDelete(product.id)}
                                            okText="Evet, Sil"
                                            cancelText="İptal"
                                        >
                                            <Button danger icon={<DeleteOutlined />} size="small">Sil</Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Modal
                title={editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ unitType: 'Piece' }}>
                    <Form.Item name="name" label="Ürün Adı" rules={[{ required: true, message: 'Lütfen ürün adını girin' }]}>
                        <Input placeholder="Ürün adını girin" />
                    </Form.Item>
                    <Form.Item name="price" label="Fiyat" rules={[{ required: true, message: 'Lütfen fiyat girin' }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value} TL`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/TL\s?|(,*)/g, '')}
                            min={0}
                        />
                    </Form.Item>
                    <Form.Item name="cost" label="Maliyet" rules={[{ required: false }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value} TL`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/TL\s?|(,*)/g, '')}
                            min={0}
                            placeholder="0"
                        />
                    </Form.Item>
                    <Form.Item name="categoryIds" label="Kategoriler" rules={[{ required: true, message: 'Lütfen en az bir kategori seçin' }]}>
                        <Select mode="multiple" placeholder="Kategori seçin">
                            {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="unitType" label="Birim Tipi" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Piece">Adet</Option>
                            <Option value="Kg">Kilogram (Kg)</Option>
                            <Option value="Liter">Litre</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="stock" label="Stok Adedi" rules={[{ required: true, message: 'Lütfen stok adedini girin' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="image" label="Ürün Resmi" extra={editingProduct && 'Yeni resim yüklenmezse mevcut resim korunacaktır.'}>
                        <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Resim Yükle</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            {editingProduct ? 'Ürünü Güncelle' : 'Ürün Ekle'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;
