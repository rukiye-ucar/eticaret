import React from 'react';
import { Typography, Row, Col, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    RobotOutlined,
    ToolOutlined,
    NodeIndexOutlined,
    DashboardOutlined,
    SafetyOutlined,
    AppstoreAddOutlined,
    GlobalOutlined,
    SettingOutlined,
    LineChartOutlined,
    ShoppingCartOutlined,
    RocketOutlined,
    DatabaseOutlined,
    TeamOutlined,
    BankOutlined,
    UserOutlined
} from '@ant-design/icons';
import depthSensor from '../assets/non-back.png'; // Using existing asset if needed for fallback, but maybe not used in new design directly

const { Title, Paragraph, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();

    // Stiller
    const sectionCardStyle = {
        padding: '50px 40px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto',
        background: 'rgba(15, 20, 35, 0.85)', // Koyu ve opak bir arka plan
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)'
    };

    const titleStyle = { color: '#f9b17a', marginBottom: '20px', textAlign: 'center' };
    const paragraphStyle = { color: '#e0e0e0', fontSize: '16px', textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px' };
    
    const cardStyle = { 
        background: 'linear-gradient(135deg, rgba(139, 168, 204, 0.15) 0%, rgba(5, 11, 20, 0.8) 100%)', 
        border: '1px solid rgba(255,255,255,0.2)', 
        borderRadius: '16px',
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
    };
    
    const iconStyle = { fontSize: '32px', color: '#f9b17a', marginBottom: '15px' };
    const cardTitleStyle = { color: '#ffffff', fontSize: '18px', marginBottom: '10px' };
    const cardTextStyle = { color: '#c0c0c0', fontSize: '14px' };

    return (
        <div style={{ width: '100%', overflowY: 'auto', padding: '40px 20px 60px 20px' }}>
            
            {/* 1. GİRİŞ / HERO BÖLÜMÜ */}
            <div style={{...sectionCardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Title level={3} style={{ color: '#f9b17a', fontWeight: 'normal', marginBottom: '24px' }}>
                    Modüler insansız su altı sistemleri ve ROV yedek parça yönetimi
                </Title>
                <Paragraph style={{ ...paragraphStyle, fontSize: '18px', marginBottom: '40px' }}>
                    Albatros, farklı operasyonel ihtiyaçlara uyum sağlayabilen modüler ROV sistemleri geliştirmeyi hedefleyen bir teknoloji girişimidir. Su altı keşif, görüntüleme, bakım-onarım ve görev bazlı operasyonlar için araç, yedek parça ve operasyon yönetimini tek bir yapı altında ele alır.
                </Paragraph>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button type="primary" size="large" style={{ background: '#f9b17a', color: '#000', fontWeight: 'bold', borderColor: '#f9b17a' }} onClick={() => navigate('/products')}>
                        ROV Sistemlerini İncele
                    </Button>
                    <Button size="large" style={{ background: 'transparent', color: '#f9b17a', borderColor: '#f9b17a' }} onClick={() => navigate('/products')}>
                        Yedek Parçaları Gör
                    </Button>
                    <Button size="large" style={{ background: 'transparent', color: '#fff', borderColor: '#fff' }} onClick={() => navigate('/about')}>
                        İletişime Geç
                    </Button>
                </div>
            </div>

            {/* 2. PROBLEM BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Su Altı Operasyonlarında Karşılaşılan Temel Sorunlar</Title>
                <Paragraph style={paragraphStyle}>
                    Su altı operasyonlarında erişim zorluğu, yüksek ekipman maliyeti, bakım-onarım süreçlerinin karmaşıklığı ve yedek parça tedariğinde yaşanan gecikmeler önemli problemlerdir. Arama-kurtarma, keşif, inceleme ve bakım görevlerinde kullanılan sistemlerin hem sahaya uygun hem de sürdürülebilir bir yapıda yönetilmesi gerekir.
                </Paragraph>
                <Row gutter={[24, 24]} justify="center">
                    {[
                        { title: 'Yüksek Maliyet', icon: <LineChartOutlined style={iconStyle} /> },
                        { title: 'Zor Bakım Süreci', icon: <ToolOutlined style={iconStyle} /> },
                        { title: 'Yedek Parça Tedariği', icon: <ShoppingCartOutlined style={iconStyle} /> },
                        { title: 'Görev Bazlı Esneklik İhtiyacı', icon: <NodeIndexOutlined style={iconStyle} /> }
                    ].map((item, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <Card bordered={false} style={{...cardStyle, textAlign: 'center'}}>
                                {item.icon}
                                <div style={cardTitleStyle}>{item.title}</div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 3. ÇÖZÜM BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Modüler ROV ve Dijital Operasyon Yaklaşımı</Title>
                <Paragraph style={paragraphStyle}>
                    Albatros, ROV sistemlerini yalnızca bir araç olarak değil; görev, yedek parça, bakım, sipariş, teslimat ve satış sonrası süreçleriyle birlikte ele alan bütüncül bir yapı olarak tasarlar. Modüler yaklaşım sayesinde farklı görevler için sensör, kamera, itki sistemi ve mekanik bileşenlerin ihtiyaca göre uyarlanması hedeflenir.
                </Paragraph>
                <Row gutter={[24, 24]} justify="center">
                    {[
                        { title: 'Modüler Görev Yapısı', icon: <AppstoreAddOutlined style={iconStyle} /> },
                        { title: 'Değiştirilebilir Bileşenler', icon: <SettingOutlined style={iconStyle} /> },
                        { title: 'Bakım ve Servis Takibi', icon: <SafetyOutlined style={iconStyle} /> },
                        { title: 'Yedek Parça Yönetimi', icon: <DatabaseOutlined style={iconStyle} /> }
                    ].map((item, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <Card bordered={false} style={{...cardStyle, textAlign: 'center'}}>
                                {item.icon}
                                <div style={cardTitleStyle}>{item.title}</div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 4. KULLANIM ALANLARI BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Kullanım Alanları</Title>
                <Paragraph style={paragraphStyle}>
                    Modüler ROV sistemleri, farklı saha ihtiyaçlarına göre yapılandırılabilir. Bu sayede hem kamu kurumları hem de özel sektör için su altı operasyonlarında esnek bir çözüm sunar.
                </Paragraph>
                <Row gutter={[24, 24]}>
                    {[
                        { title: 'Arama Kurtarma', desc: 'Riskli su altı bölgelerinde ön keşif ve görüntüleme yapılmasına destek olur.' },
                        { title: 'Baraj ve Gölet İncelemeleri', desc: 'Su altındaki yapıların ve çevresel koşulların izlenmesinde kullanılabilir.' },
                        { title: 'Liman ve Gemi Altı Kontrolleri', desc: 'Gemi altı, iskele ve liman yapılarının ön inceleme süreçlerinde görev alabilir.' },
                        { title: 'Bakım ve Onarım Operasyonları', desc: 'Su altı ekipmanlarının durum tespiti ve bakım planlamasında kullanılabilir.' },
                        { title: 'Eğitim ve Ar-Ge', desc: 'Üniversiteler, teknik ekipler ve araştırma grupları için geliştirilebilir bir platform sunar.' },
                        { title: 'Çevresel Gözlem', desc: 'Su altı ortamının görüntülenmesi ve belirli sensörlerle veri toplanması için kullanılabilir.' }
                    ].map((item, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <Card bordered={false} style={cardStyle}>
                                <div style={{...cardTitleStyle, color: '#f9b17a'}}>{item.title}</div>
                                <div style={cardTextStyle}>{item.desc}</div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 5. MODÜLER YAPI BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Operasyonel ve Görevsel Modülerlik</Title>
                <Paragraph style={paragraphStyle}>
                    Geliştirilen yapı, tek tip kullanım yerine farklı görev senaryolarına göre özelleştirilebilir bir ROV yaklaşımına dayanır. Görev ihtiyacına göre kamera, sensör, itki sistemi, aydınlatma, gövde bileşenleri ve kontrol yapıları değiştirilebilir veya geliştirilebilir.
                </Paragraph>
                <Row gutter={[24, 24]} justify="center">
                    {[
                        'Göreve Uygun Donanım Seçimi',
                        'Sensör ve Kamera Entegrasyonu',
                        'Bakım-Onarım Kolaylığı',
                        'Parça Değişimi ve Teknik Servis Süreci'
                    ].map((item, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: '16px' }}>{item}</Text>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 6. YEDEK PARÇA VE BAKIM MODELİ BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Yedek Parça, Bakım ve Satış Sonrası Süreçler</Title>
                <Paragraph style={paragraphStyle}>
                    ROV sistemlerinde sürdürülebilirlik yalnızca aracın geliştirilmesiyle sınırlı değildir. Motor, batarya, sensör, elektronik kart, sızdırmazlık elemanları ve mekanik parçaların düzenli olarak takip edilmesi gerekir. Bu nedenle Albatros, yedek parça tedariği ve bakım-onarım süreçlerini de iş modelinin önemli bir parçası olarak ele alır.
                </Paragraph>
                <Row gutter={[16, 16]} justify="center">
                    {[
                        'Motor ve İtki Bileşenleri',
                        'Sensör ve Elektronik Parçalar',
                        'Batarya ve Güç Sistemleri',
                        'Mekanik Bağlantı Elemanları',
                        'Sızdırmazlık ve Gövde Parçaları',
                        'Teknik Servis ve Bakım Süreci'
                    ].map((item, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <Card bordered={false} style={{...cardStyle, textAlign: 'center', padding: '10px 0'}}>
                                <Text style={{ color: '#f9b17a', fontSize: '15px', fontWeight: 'bold' }}>{item}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 7. DİJİTAL YÖNETİM PANELİ BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Dijital Operasyon ve Satış Yönetimi</Title>
                <Paragraph style={paragraphStyle}>
                    Proje kapsamında yalnızca fiziksel ROV sistemi değil, bu sistemin ticari ve operasyonel süreçlerini yönetebilecek dijital bir altyapı da düşünülmektedir. Ürün yönetimi, sipariş takibi, fatura kayıtları, teslimat süreçleri, kategori bazlı satış dağılımı ve kâr analizi gibi özellikler sayesinde girişimin satış sonrası süreçleri daha düzenli takip edilebilir.
                </Paragraph>
                <Row gutter={[16, 16]} justify="center">
                    {[
                        { title: 'Ürün Yönetimi', icon: <AppstoreAddOutlined /> },
                        { title: 'Sipariş Takibi', icon: <ShoppingCartOutlined /> },
                        { title: 'Fatura Kayıtları', icon: <DatabaseOutlined /> },
                        { title: 'Satış ve Kâr Analizi', icon: <LineChartOutlined /> },
                        { title: 'Teslimat Süreci', icon: <RocketOutlined /> },
                        { title: 'Kategori Bazlı Raporlama', icon: <DashboardOutlined /> }
                    ].map((item, index) => (
                        <Col xs={12} sm={8} md={4} key={index}>
                            <div style={{ textAlign: 'center', color: '#fff' }}>
                                <div style={{ fontSize: '30px', color: '#8ba8cc', marginBottom: '10px' }}>{item.icon}</div>
                                <div style={{ fontSize: '14px' }}>{item.title}</div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 8. HEDEF KİTLE BÖLÜMÜ */}
            <div style={sectionCardStyle}>
                <Title level={2} style={titleStyle}>Hedef Kullanıcılar ve Müşteri Grupları</Title>
                <Paragraph style={paragraphStyle}>
                    Albatros'un hedef kitlesi; su altı keşif, inceleme, bakım ve operasyon süreçlerinde daha erişilebilir, yönetilebilir ve modüler çözümlere ihtiyaç duyan kurum ve ekiplerden oluşur.
                </Paragraph>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={cardStyle}>
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <TeamOutlined style={iconStyle} />
                            </div>
                            <Title level={4} style={{ color: '#f9b17a', textAlign: 'center' }}>Kullanıcılar</Title>
                            <Paragraph style={{ color: '#e0e0e0', textAlign: 'center' }}>
                                Arama-kurtarma ekipleri, dalgıç ekipleri, teknik bakım ekipleri, araştırma ekipleri.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={cardStyle}>
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <BankOutlined style={iconStyle} />
                            </div>
                            <Title level={4} style={{ color: '#f9b17a', textAlign: 'center' }}>Satın Alan Kurumlar</Title>
                            <Paragraph style={{ color: '#e0e0e0', textAlign: 'center' }}>
                                Belediyeler, afet yönetimi birimleri, liman işletmeleri, su ürünleri işletmeleri, bakım-onarım firmaları ve eğitim kurumları.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card bordered={false} style={cardStyle}>
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <UserOutlined style={iconStyle} />
                            </div>
                            <Title level={4} style={{ color: '#f9b17a', textAlign: 'center' }}>Kararı Etkileyen Kişiler</Title>
                            <Paragraph style={{ color: '#e0e0e0', textAlign: 'center' }}>
                                Operasyon sorumluları, teknik müdürler, satın alma birimleri ve saha güvenliği yetkilileri.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* 9. KISA TANITIM / SON ÇAĞRI BÖLÜMÜ */}
            <div style={{...sectionCardStyle, textAlign: 'center'}}>
                <Title level={2} style={{ color: '#ffffff', marginBottom: '20px' }}>Su Altı Operasyonları İçin Bütüncül Bir Yaklaşım</Title>
                <Paragraph style={{ ...paragraphStyle, marginBottom: '40px' }}>
                    Albatros; modüler ROV sistemleri, yedek parça tedariği, bakım-onarım süreçleri ve dijital operasyon yönetimini bir araya getirerek su altı teknolojilerinde sürdürülebilir bir yapı kurmayı hedefler.
                </Paragraph>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button type="primary" size="large" style={{ background: '#f9b17a', color: '#000', fontWeight: 'bold', borderColor: '#f9b17a' }} onClick={() => navigate('/about')}>
                        İletişime Geç
                    </Button>
                    <Button size="large" style={{ background: 'transparent', color: '#f9b17a', borderColor: '#f9b17a' }} onClick={() => navigate('/products')}>
                        ROV Parçalarını İncele
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default Home;
