import { useNavigate } from 'react-router-dom';
import logo from '../assets/non-back.png';
import './About.css';

const stats = [
    { value: '2023', label: 'Founded' },
    { value: '100%', label: 'Domestic Production' },
    { value: 'ROV', label: 'Specialization' },
    { value: 'Türkiye', label: 'Origin' },
];

const sections = [
    {
        icon: '🎯',
        title: 'Our Mission',
        body: 'To produce world-class, domestically manufactured components for remotely operated underwater vehicles — eliminating dependency on foreign supply chains and empowering Turkish maritime technology to lead the next era of underwater exploration.',
    },
    {
        icon: '🔭',
        title: 'Our Vision',
        body: "A future where every ROV operating beneath the world's seas carries a trace of Anatolian craftsmanship and ingenuity — where Turkish engineering is not an alternative, it is the benchmark.",
    },
    {
        icon: '⚓',
        title: 'The Albatros Legacy',
        body: 'Named in honour of the spirit of Barbaros Hayrettin Pasha — the Grand Admiral who commanded the Mediterranean and redrew the map of naval power — Albatros carries that audacious legacy into the deep. We do not follow the current. We set it.',
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
                <h1 className="about-hero-title">Born from the Sea.<br />Built for the Deep.</h1>
                <p className="about-hero-sub">
                    Albatros engineers domestic ROV spare parts that carry the spirit of the seas —
                    from the Bosphorus to the ocean floor.
                </p>
                <button className="about-cta" onClick={() => navigate('/products')}>
                    Explore Our Products
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
                    "We do not follow the current.<br />We set it."
                </blockquote>
                <cite>— Albatros, Türkiye</cite>
            </section>
        </div>
    );
};

export default About;
