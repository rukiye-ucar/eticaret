import { useNavigate } from 'react-router-dom';
import logo from '../assets/non-back.png';
import './About.css';

const stats = [
    { value: '2023', label: 'Kuruluş Yılı' },
    { value: '100%', label: 'Yerli Üretim' },
    { value: 'ROV', label: 'Uzmanlık Alanı' },
    { value: 'Türkiye', label: 'Menşei' },
];

const sections = [
    {
        icon: '🎯',
        title: 'Misyonumuz',
        body: 'Uzaktan kumandalı su altı araçları için dünya standartlarında, yerli üretim parçalar üretmek, yabancı tedarik zincirlerine olan bağımlılığı ortadan kaldırmak ve Türk denizcilik teknolojisinin su altı keşfinin yeni çağına öncülük etmesini sağlamak.',
    },
    {
        icon: '🔭',
        title: 'Vizyonumuz',
        body: "Dünyanın denizlerinde faaliyet gösteren her ROV'un bir parça Anadolu ustalığı ve yaratıcılığı taşıdığı bir gelecek. Türk mühendisliğinin bir alternatif değil, bir referans noktası olduğu bir dünya.",
    },
    {
        icon: '⚓',
        title: 'Albatros Mirası',
        body: "Akdeniz'e hükmeden ve deniz gücünün haritasını yeniden çizen Kaptan-ı Derya Barbaros Hayreddin Paşa'nın ruhuna ithafen adlandırılan Albatros, o cesur mirası derinliklere taşır. Biz akıntıya kapılmayız. Biz akıntıyı yaratırız.",
    },
];

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="about-page">
            {/* ── Hero ── */}
            <section className="about-hero">
                <div className="about-hero-glow" />
                <img src={logo} alt="Albatros" className="about-hero-logo" />
                <h1 className="about-hero-title">Denizden Doğdu.<br />Derinlikler İçin Yapıldı.</h1>
                <p className="about-hero-sub">
                    Albatros, denizlerin ruhunu taşıyan yerli ROV yedek parçaları üretir —
                    Boğaz'dan okyanus derinliklerine kadar.
                </p>
                <button className="about-cta" onClick={() => navigate('/products')}>
                    Ürünlerimizi Keşfet
                </button>
            </section>

            {/* ── Stats ── */}
            <section className="about-stats">
                {stats.map((s) => (
                    <div key={s.label} className="about-stat-card">
                        <span className="about-stat-value">{s.value}</span>
                        <span className="about-stat-label">{s.label}</span>
                    </div>
                ))}
            </section>

            {/* ── Divider line ── */}
            <div className="about-divider" />

            {/* ── Content sections ── */}
            <section className="about-sections">
                {sections.map((sec) => (
                    <div key={sec.title} className="about-section-card">
                        <span className="about-section-icon">{sec.icon}</span>
                        <h2 className="about-section-title">{sec.title}</h2>
                        <p className="about-section-body">{sec.body}</p>
                    </div>
                ))}
            </section>

            {/* ── Footer quote ── */}
            <section className="about-quote">
                <blockquote>
                    "Biz akıntıya kapılmayız.<br />Biz akıntıyı yaratırız."
                </blockquote>
                <cite>— Albatros, Türkiye</cite>
            </section>
        </div>
    );
};

export default About;
