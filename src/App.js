import React, { useEffect, useState } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import "./App.scss";
//Components
import Header from "./components/header";
import { Html, useGLTFLoader } from "drei";
import { Section } from "./components/section";
import { Suspense, useRef } from "react";
import { OrbitControls, Stars } from "drei";

import state from "./components/state";

import { useInView } from "react-intersection-observer";

const Model = ({ modelPath, scale }) => {
  const gltf = useGLTFLoader(modelPath, true);
  return (
    <primitive
      object={gltf.scene}
      dispose={null}
      scale={[scale, scale, scale]}
    />
  );
};

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        colorManagement={true}
        color="#555"
      />
      <directionalLight position={[0, 10, 0]} intensity={1.5} />
      <spotLight position={[1000, 0, 0]} intensity={1} />
    </>
  );
};

const HTMLContent = ({
  domContent,
  children,
  modelPath,
  position,
  bgColor,
  scale,
}) => {
  const ref = useRef();
  const [refItem, inView] = useInView({
    threshold: 0,
  });
  let upDirection = true;

  useFrame(() => {
    // console.log(ref.current.rotation.y);
    if (ref.current.rotation.y < -0.3) {
      upDirection = false;
    }
    if (ref.current.rotation.y > 0.3) {
      upDirection = true;
    }

    if (upDirection) {
      // ref.current.rotation.x -= 0.001;
      ref.current.rotation.y -= 0.001;
    } else {
      // ref.current.rotation.x += 0.001;
      ref.current.rotation.y += 0.001;
    }
  });

  const [hovered, setHovered] = useState(true);
  useEffect(() => {
    inView && (document.body.style.backgroundColor = bgColor);
  }, [inView]);
  return (
    <Section factor={1.5} offset={1}>
      <group position={[0, position, 0]}>
        <mesh ref={ref} position={[0, -35, 0]}>
          {modelPath && <Model modelPath={modelPath} scale={scale} />}
          <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
        </mesh>
        <Html portal={domContent} fullscreen>
          <div ref={refItem} className="container">
            {children}
          </div>
        </Html>
      </group>
    </Section>
  );
};

export default function App() {
  const domContent = useRef();
  const scrollArea = useRef();
  const onScroll = (e) => {
    state.top.current = e.target.scrollTop;
    // console.log(e.target.scrollTop);
    const newScale = (1600 - e.target.scrollTop) / 40;
    // console.log(newScale);
    setScale(newScale);
  };

  useEffect(() => {
    void onScroll({ target: scrollArea.current });
  }, []);

  const [scale, setScale] = useState(40);

  return (
    <>
      <Header />
      <Canvas colorManagement camera={{ position: [10, 25, 120], fov: 70 }}>
        <Lights />
        <Suspense fallback={null}>
          <HTMLContent
            domContent={domContent}
            modelPath="/BDome.gltf"
            position={500 / 3}
            scale={scale}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/1920px-BITS_Pilani-Logo.svg.png"
              height={100}
            />
            <h1 className="title">BITS Pilani</h1>
            <div>
              <h2 className="sub-title">K.K. Birla Goa Campus</h2>
            </div>
          </HTMLContent>
          <HTMLContent domContent={domContent} position={0} scale={scale}>
            <h1 className="title">Great things take time.</h1>
            <div>
              <h2 className="sub-title">Website coming soon...</h2>
            </div>
          </HTMLContent>
          <OrbitControls />

          <Stars
            radius={100} // Radius of the inner sphere (default=100)
            depth={50} // Depth of area where stars should fit (default=50)
            count={5000} // Amount of stars (default=5000)
            factor={4} // Size factor (default=4)
            saturation={0} // Saturation 0-1 (default=0)
            fade // Faded dots (default=false)
          />
        </Suspense>
      </Canvas>
      <div className="scrollArea" ref={scrollArea} onScroll={onScroll}>
        <div style={{ position: "sticky", top: 0 }} ref={domContent}></div>
        <div style={{ height: `${state.pages * 100}vh ` }}></div>
      </div>
    </>
  );
}
