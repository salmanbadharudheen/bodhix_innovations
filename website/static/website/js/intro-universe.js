const universeCanvas = document.querySelector("[data-intro-universe]");
const universeSection = universeCanvas?.closest("[data-experience-section]");
const universeVisual = universeCanvas?.closest("[data-experience-visual]");

if (universeCanvas && universeSection && universeVisual) {
  const gl = universeCanvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });

  if (!gl) {
    console.warn("WebGL 2 is unavailable; using the static Who we are visual.");
  } else {
    const vertexSource = `#version 300 es
      in vec2 aPosition;
      out vec2 vUv;

      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSource = `#version 300 es
      precision highp float;

      in vec2 vUv;
      out vec4 outColor;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uTime;
      uniform float uScroll;
      uniform int uStepLimit;
      uniform int uShardLimit;

      vec3 rotateX(vec3 p, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
      }

      vec3 rotateY(vec3 p, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
      }

      vec3 rotateZ(vec3 p, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
      }

      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }

      float sdOctahedron(vec3 p, float s) {
        p = abs(p);
        return (p.x + p.y + p.z - s) * 0.57735027;
      }

      float sdSegment(vec3 p, vec3 a, vec3 b, float radius) {
        vec3 pa = p - a;
        vec3 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h) - radius;
      }

      float twistedTorus(vec3 p, float time) {
        float angle = atan(p.z, p.x);
        p.y -= 0.07 * sin(angle * 2.0 + time * 0.32);
        float radial = length(p.xz) - 0.83;
        float twist = angle * 2.0 + time * 0.24;
        vec2 crossSection = vec2(
          radial * cos(twist) - p.y * sin(twist),
          radial * sin(twist) + p.y * cos(twist)
        );
        crossSection *= vec2(1.0, 1.34);
        return length(crossSection) - (0.19 + 0.018 * sin(angle * 3.0 + time * 0.25));
      }

      float morphingSphere(vec3 p, float time) {
        float wave = sin(p.x * 11.0 + time * 0.8)
          * sin(p.y * 9.0 - time * 0.65)
          * sin(p.z * 12.0 + time * 0.55);
        return length(p) - 0.29 - wave * 0.04;
      }

      vec2 mapScene(vec3 p, float time) {
        vec3 torusPoint = rotateX(
          rotateZ(
            rotateY(p, sin(time * 0.12) * 0.12 + uPointer.x * 0.18),
            time * 0.12 + uScroll * 0.42
          ),
          1.28 + uPointer.y * 0.1
        );
        torusPoint *= 1.08;
        vec2 result = vec2(twistedTorus(torusPoint, time), 1.0);

        vec3 spherePoint = rotateY(p - vec3(1.05, 0.76, -0.12), -time * 0.3);
        float sphereDistance = morphingSphere(spherePoint, time);
        if (sphereDistance < result.x) result = vec2(sphereDistance, 3.0);

        for (int i = 0; i < 6; i++) {
          if (i >= uShardLimit) break;
          float index = float(i);
          float orbit = index * 1.0472 + time * (0.18 + index * 0.012) + uScroll * 0.42;
          vec3 center = vec3(cos(orbit) * 1.42, sin(orbit) * 1.16, sin(orbit * 1.7) * 0.44);
          vec3 shard = p - center;
          shard = rotateY(rotateZ(shard, orbit * 0.7), orbit * 0.8 + time * 0.17);
          float shardDistance = sdOctahedron(shard, 0.22 + 0.025 * sin(index + time * 0.7));
          if (shardDistance < result.x) result = vec2(shardDistance, 2.0);
        }

        vec3 framePoint = rotateY(p - vec3(-1.2, 0.12, 0.18), time * -0.19);
        framePoint = rotateZ(framePoint, 0.72);
        float frameDistance = min(
          sdSegment(framePoint, vec3(-0.3, -0.3, 0.0), vec3(0.3, -0.3, 0.0), 0.018),
          min(
            sdSegment(framePoint, vec3(0.3, -0.3, 0.0), vec3(0.3, 0.3, 0.0), 0.018),
            min(
              sdSegment(framePoint, vec3(0.3, 0.3, 0.0), vec3(-0.3, 0.3, 0.0), 0.018),
              sdSegment(framePoint, vec3(-0.3, 0.3, 0.0), vec3(-0.3, -0.3, 0.0), 0.018)
            )
          )
        );
        if (frameDistance < result.x) result = vec2(frameDistance, 4.0);

        vec3 energyStart = vec3(0.38, 0.76 + sin(time * 1.3) * 0.05, 0.12);
        vec3 energyEnd = vec3(1.05, 0.76, -0.12);
        float energyDistance = sdSegment(p, energyStart, energyEnd, 0.011);
        if (energyDistance < result.x) result = vec2(energyDistance, 5.0);

        return result;
      }

      vec3 sceneNormal(vec3 p, float time) {
        vec2 e = vec2(0.0016, -0.0016);
        return normalize(
          e.xyy * mapScene(p + e.xyy, time).x
          + e.yyx * mapScene(p + e.yyx, time).x
          + e.yxy * mapScene(p + e.yxy, time).x
          + e.xxx * mapScene(p + e.xxx, time).x
        );
      }

      vec3 studioReflection(vec3 direction) {
        float horizon = smoothstep(-0.45, 0.55, direction.y);
        vec3 environment = mix(vec3(0.018, 0.028, 0.055), vec3(0.16, 0.21, 0.31), horizon);
        vec2 keyPanel = (direction.xy - vec2(0.3, 0.58)) * vec2(3.0, 2.0);
        vec2 rimPanel = (direction.xy - vec2(-0.58, -0.12)) * vec2(2.2, 3.8);
        vec2 violetPanel = (direction.xy - vec2(0.68, -0.3)) * vec2(3.2, 2.0);
        vec2 warmPanel = (direction.xy - vec2(-0.18, 0.72)) * vec2(4.0, 2.4);
        float whitePanel = exp(-dot(keyPanel, keyPanel));
        float bluePanel = exp(-dot(rimPanel, rimPanel));
        float purplePanel = exp(-dot(violetPanel, violetPanel));
        float amberPanel = exp(-dot(warmPanel, warmPanel));
        environment += vec3(0.96, 0.98, 1.0) * whitePanel * 0.92;
        environment += vec3(0.12, 0.62, 1.0) * bluePanel * 0.76;
        environment += vec3(0.5, 0.2, 0.92) * purplePanel * 0.62;
        environment += vec3(1.0, 0.48, 0.16) * amberPanel * 0.42;
        return environment;
      }

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        float time = uTime;
        vec2 screen = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
        vec3 rayOrigin = vec3(uPointer.x * 0.22, uPointer.y * 0.16, 3.05 - uScroll * 0.22);
        vec3 rayDirection = normalize(vec3(screen * 0.78 - uPointer * 0.08, -1.55));
        float distanceAlongRay = 0.0;
        float material = 0.0;
        bool hit = false;

        for (int i = 0; i < 56; i++) {
          if (i >= uStepLimit) break;
          vec2 hitData = mapScene(rayOrigin + rayDirection * distanceAlongRay, time);
          if (hitData.x < 0.0015) {
            material = hitData.y;
            hit = true;
            break;
          }
          distanceAlongRay += hitData.x * 0.82;
          if (distanceAlongRay > 5.2) break;
        }

        if (!hit) {
          vec2 cell = floor((vUv + vec2(time * 0.003, 0.0)) * vec2(19.0, 17.0));
          vec2 local = fract((vUv + vec2(time * 0.003, 0.0)) * vec2(19.0, 17.0)) - 0.5;
          float seed = hash21(cell);
          float star = (1.0 - smoothstep(0.012, 0.035, length(local))) * step(0.965, seed);
          float aura = exp(-dot(screen, screen) * 1.7);
          float pulse = 0.5 + 0.5 * sin(time * 0.8 + screen.x * 3.0);
          vec3 atmosphere = vec3(0.12, 0.48, 0.78) * aura * (0.06 + pulse * 0.035);
          atmosphere += vec3(0.42, 0.15, 0.75) * exp(-dot(screen - vec2(0.4, -0.25), screen - vec2(0.4, -0.25)) * 5.0) * 0.04;
          vec3 color = atmosphere + vec3(0.25, 0.68, 1.0) * star * (0.3 + pulse * 0.5);
          float alpha = min(0.24, aura * 0.13 + star * 0.7);
          outColor = vec4(color * alpha, alpha);
          return;
        }

        vec3 position = rayOrigin + rayDirection * distanceAlongRay;
        vec3 normal = sceneNormal(position, time);
        vec3 viewDirection = normalize(rayOrigin - position);
        vec3 reflected = reflect(-viewDirection, normal);
        vec3 environment = studioReflection(reflected);
        float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 5.0);
        vec3 lightDirection = normalize(vec3(-0.45, 0.78, 0.62));
        float diffuse = max(dot(normal, lightDirection), 0.0);
        float highlight = pow(max(dot(reflect(-lightDirection, normal), viewDirection), 0.0), 42.0);
        vec3 color;
        float alpha = 1.0;

        if (material < 1.5) {
          vec3 chrome = mix(vec3(0.19, 0.22, 0.29), environment, 0.9);
          float ringAngle = atan(position.z, position.x);
          float energy = pow(max(0.0, cos(ringAngle * 7.0 - time * 1.4)), 28.0);
          float warmEnergy = pow(max(0.0, cos(ringAngle * 5.0 + time * 0.8 + 1.6)), 34.0);
          float edge = pow(max(0.0, 1.0 - abs(normal.y)), 5.0);
          color = chrome * (0.38 + diffuse * 0.4) + vec3(0.72, 0.84, 1.0) * highlight * 1.25;
          color += vec3(0.05, 0.48, 1.0) * energy * 1.25 + vec3(0.42, 0.16, 0.95) * edge * 0.28;
          color += vec3(1.0, 0.38, 0.12) * warmEnergy * 0.68;
        } else if (material < 2.5) {
          vec3 glass = mix(vec3(0.055, 0.13, 0.22), environment, 0.82);
          color = glass * (0.28 + diffuse * 0.16) + vec3(0.18, 0.72, 1.0) * fresnel * 1.55;
          color += vec3(0.66, 0.36, 1.0) * pow(max(dot(normal, normalize(vec3(0.5, 0.6, 0.8))), 0.0), 14.0) * 0.72;
          color += vec3(0.85, 0.94, 1.0) * highlight * 1.4;
          alpha = 0.28 + fresnel * 0.55;
        } else if (material < 3.5) {
          color = mix(vec3(0.12, 0.16, 0.24), environment, 0.84);
          color += vec3(0.18, 0.66, 1.0) * fresnel * 0.82;
          color += vec3(0.58, 0.36, 1.0) * fresnel * 0.55;
          color += vec3(0.72, 0.88, 1.0) * highlight * 1.4;
        } else if (material < 4.5) {
          color = mix(vec3(0.13, 0.16, 0.23), environment, 0.86);
          color += vec3(0.12, 0.6, 0.92) * fresnel * 0.7 + vec3(0.6, 0.35, 1.0) * highlight;
        } else {
          float flow = 0.5 + 0.5 * sin(time * 6.0 + position.x * 8.0 + position.y * 11.0);
          color = mix(vec3(0.08, 0.44, 1.0), vec3(0.56, 0.22, 1.0), flow);
          color *= 1.2 + flow * 0.8;
          color += vec3(0.45, 0.8, 1.0) * highlight;
        }

        float fog = smoothstep(2.2, 5.0, distanceAlongRay);
        color = mix(color, vec3(0.16, 0.2, 0.32), fog * 0.35);
        color = pow(max(color, 0.0), vec3(0.88));
        outColor = vec4(color * alpha, alpha);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Who we are WebGL shader compilation failed:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      console.warn("Using the static Who we are visual because its WebGL shader could not be created.");
    } else {
      const program = gl.createProgram();

      if (!program) {
        console.warn("Using the static Who we are visual because its WebGL program could not be created.");
      } else {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error("Who we are WebGL program linking failed:", gl.getProgramInfoLog(program));
          gl.deleteProgram(program);
        } else {
          const vertices = new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1,
          ]);
          const buffer = gl.createBuffer();
          const positionLocation = gl.getAttribLocation(program, "aPosition");
          const resolutionLocation = gl.getUniformLocation(program, "uResolution");
          const pointerLocation = gl.getUniformLocation(program, "uPointer");
          const timeLocation = gl.getUniformLocation(program, "uTime");
          const scrollLocation = gl.getUniformLocation(program, "uScroll");
          const stepLimitLocation = gl.getUniformLocation(program, "uStepLimit");
          const shardLimitLocation = gl.getUniformLocation(program, "uShardLimit");
          const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
          const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
          const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
          let visible = !("IntersectionObserver" in window);
          let frame;
          let scroll = 0;
          let targetScroll = 0;
          let lastFrameTime = 0;

          gl.useProgram(program);
          if (!buffer) {
            console.error("Who we are WebGL vertex buffer could not be created.");
          } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.clearColor(0, 0, 0, 0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            universeVisual.classList.add("intro__visual--webgl");

            const resize = () => {
              const bounds = universeCanvas.getBoundingClientRect();
              const mobile = window.matchMedia("(max-width: 640px)").matches;
              const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 0.64 : 0.82);
              universeCanvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
              universeCanvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
              gl.viewport(0, 0, universeCanvas.width, universeCanvas.height);
              gl.useProgram(program);
              gl.uniform2f(resolutionLocation, universeCanvas.width, universeCanvas.height);
              requestRender();
            };

            const updateScroll = () => {
              const bounds = universeSection.getBoundingClientRect();
              const sectionCenter = bounds.top + bounds.height / 2;
              targetScroll = Math.max(-1, Math.min(1, (window.innerHeight / 2 - sectionCenter) / (window.innerHeight + bounds.height)));
              requestRender();
            };

            const render = (time) => {
              frame = undefined;
              if (!visible || document.hidden) return;

              const reducedMotion = motionPreference.matches;
              const frameInterval = window.matchMedia("(max-width: 640px)").matches ? 1000 / 24 : 1000 / 30;
              if (!reducedMotion && time - lastFrameTime < frameInterval) {
                frame = window.requestAnimationFrame(render);
                return;
              }
              lastFrameTime = time;

              if (reducedMotion) {
                pointer.x = 0;
                pointer.y = 0;
                scroll = 0;
              } else {
                pointer.x += (pointer.targetX - pointer.x) * 0.075;
                pointer.y += (pointer.targetY - pointer.y) * 0.075;
                scroll += (targetScroll - scroll) * 0.045;
              }

              gl.clear(gl.COLOR_BUFFER_BIT);
              gl.useProgram(program);
              gl.uniform1f(timeLocation, reducedMotion ? 0 : time * 0.001);
              gl.uniform2f(pointerLocation, pointer.x, pointer.y);
              gl.uniform1f(scrollLocation, scroll);
              gl.uniform1i(stepLimitLocation, window.matchMedia("(max-width: 640px)").matches ? 24 : 48);
              gl.uniform1i(shardLimitLocation, window.matchMedia("(max-width: 640px)").matches ? 3 : 6);
              gl.drawArrays(gl.TRIANGLES, 0, 6);

              if (!reducedMotion) frame = window.requestAnimationFrame(render);
            };

            function requestRender() {
              if (!frame && visible && !document.hidden) {
                frame = window.requestAnimationFrame(render);
              }
            }

            if (finePointer.matches) {
              universeSection.addEventListener("pointermove", (event) => {
                const bounds = universeVisual.getBoundingClientRect();
                pointer.targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
                pointer.targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
                requestRender();
              }, { passive: true });

              universeSection.addEventListener("pointerleave", () => {
                pointer.targetX = 0;
                pointer.targetY = 0;
                requestRender();
              });
            }

            window.addEventListener("scroll", updateScroll, { passive: true });
            window.addEventListener("resize", resize, { passive: true });
            document.addEventListener("visibilitychange", requestRender);
            motionPreference.addEventListener("change", requestRender);

            if ("IntersectionObserver" in window) {
              const observer = new IntersectionObserver((entries) => {
                visible = entries.some((entry) => entry.isIntersecting);
                if (visible) requestRender();
              }, { rootMargin: "160px" });
              observer.observe(universeSection);
            }

            resize();
            updateScroll();
          }
        }
      }
    }
  }
}
