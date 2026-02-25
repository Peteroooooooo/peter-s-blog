import React, { useState, useEffect } from 'react';
import { ArtifactCarousel } from '../components/artifacts/ArtifactCarousel';
import { ArtifactDetail } from '../components/artifacts/ArtifactDetail';
import { Artifact } from '../content/types';

// Sample artifacts data
const artifacts: Artifact[] = [
    {
        id: 'A-201',
        title: 'Quantitative Trading System',
        category: 'PROJECT',
        date: '2025.11.20',
        description: 'A high-frequency trading engine built with Python, featuring real-time market data streaming, multi-strategy backtesting, and automated order execution via broker APIs.',
        techStack: ['Python', 'Pandas', 'NumPy', 'FastAPI'],
        projectUrl: '#',
    },
    {
        id: 'A-202',
        title: 'IoT Sensor Network',
        category: 'PROJECT',
        date: '2025.09.14',
        description: 'Mesh network of ESP32 microcontrollers collecting environmental data. Features BLE mesh communication, edge ML inference, and a real-time dashboard.',
        techStack: ['C++', 'ESP-IDF', 'BLE', 'TensorFlow Lite'],
        projectUrl: '#',
    },
    {
        id: 'A-203',
        title: 'Neural Style Transfer Engine',
        category: 'PROJECT',
        date: '2025.06.03',
        description: 'Real-time artistic style transfer using optimized neural networks. Supports video input with <50ms latency on consumer GPUs.',
        techStack: ['PyTorch', 'ONNX', 'CUDA', 'OpenCV'],
        projectUrl: '#',
    },
    {
        id: 'A-204',
        title: 'Portfolio & Blog Platform',
        category: 'PROJECT',
        date: '2025.03.22',
        description: 'This very website — a cyberpunk-themed personal portfolio built with React and Vite displaying projects and writings.',
        techStack: ['React', 'TypeScript', 'Vite', 'GSAP'],
        projectUrl: '#',
    },
    {
        id: 'A-205',
        title: 'Autonomous Drone Controller',
        category: 'PROJECT',
        date: '2024.12.10',
        description: 'Flight controller firmware with PID stabilization, GPS waypoint navigation, and computer vision-based obstacle avoidance running on embedded Linux.',
        techStack: ['Rust', 'ROS2', 'OpenCV', 'PX4'],
        projectUrl: '#',
    },
    {
        id: 'A-206',
        title: 'Distributed Task Scheduler',
        category: 'PROJECT',
        date: '2024.08.15',
        description: 'A fault-tolerant distributed job scheduler inspired by Kubernetes CronJobs, with leader election, task deduplication, and retry policies.',
        techStack: ['Go', 'gRPC', 'etcd', 'Docker'],
        projectUrl: '#',
    },
];

export const Artifacts: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isEntered, setIsEntered] = useState(false);
    const [detailArtifact, setDetailArtifact] = useState<Artifact | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsEntered(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="artifacts-page">
            {/* Carousel */}
            <div className={`artifacts-page__carousel ${isEntered ? 'artifacts-page__carousel--visible' : ''}`}>
                <ArtifactCarousel
                    artifacts={artifacts}
                    selectedIndex={selectedIndex}
                    onSelectIndex={setSelectedIndex}
                    onOpenDetail={setDetailArtifact}
                />
            </div>

            {/* Header */}
            <div className={`artifacts-page__header ${isEntered ? 'artifacts-page__header--visible' : ''}`}>
                <span className="artifacts-page__header-label">ARTIFACT_REGISTRY</span>
                <span className="artifacts-page__header-meta">▸ {artifacts.length} PROJECTS LOADED</span>
            </div>

            {/* Detail overlay */}
            {detailArtifact && (
                <ArtifactDetail
                    artifact={detailArtifact}
                    onClose={() => setDetailArtifact(null)}
                />
            )}

            <style>{`
                .artifacts-page {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }

                /* Header */
                .artifacts-page__header {
                    position: absolute;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.6s ease 0.2s;
                    pointer-events: none;
                    z-index: 20;
                }
                .artifacts-page__header--visible { opacity: 1; }
                .artifacts-page__header-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    color: rgba(255,255,255,0.4);
                    letter-spacing: 0.3em;
                }
                .artifacts-page__header-meta {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(0,255,255,0.35);
                }

                /* Carousel zone — vw-based positioning to match cube's 15vw offset */
                .artifacts-page__carousel {
                    position: absolute;
                    left: calc(50% + 5vw);
                    top: 0;
                    bottom: 0;
                    width: 460px;
                    z-index: 15;
                    pointer-events: auto;
                    opacity: 0;
                    transform: translateX(30px);
                    transition: opacity 0.6s ease 0.3s, transform 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s;
                }
                .artifacts-page__carousel--visible {
                    opacity: 1;
                    transform: translateX(0);
                }

                @media (max-width: 1024px) {
                    .artifacts-page__carousel {
                        left: 50%;
                        transform: translateX(-50%);
                    }
                    .artifacts-page__carousel--visible {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
};
