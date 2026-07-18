(function() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const canvas = document.getElementById('gravity-canvas');
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const particleCount = 65;
  let mouse = { x: null, y: null, radius: 140 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }

      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          let forceX = (dx / distance) * force * 1.5;
          let forceY = (dy / distance) * force * 1.5;
          this.x += forceX;
          this.y += forceY;
        }
      }
    }

    draw() {
      ctx.fillStyle = `rgba(245, 245, 247, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          let alpha = (1 - (distance / 120)) * 0.12;
          ctx.strokeStyle = `rgba(245, 245, 247, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();

  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  const bentoCards = document.querySelectorAll('[data-tilt]');
  bentoCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);

      const cardWidth = rect.width;
      const cardHeight = rect.height;
      const centerX = rect.left + cardWidth / 2;
      const centerY = rect.top + cardHeight / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateX = (-1 * (mouseY / (cardHeight / 2)) * 6).toFixed(2);
      const rotateY = ((mouseX / (cardWidth / 2)) * 6).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  const consoleTabs = document.querySelectorAll('.console-tab');
  const consoleTabContents = document.querySelectorAll('.console-tab-content');

  consoleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      consoleTabs.forEach(t => t.classList.remove('active'));
      consoleTabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  const terminalInput = document.querySelector('.cursor-input');
  const terminalLog = document.querySelector('.terminal-log');
  
  if (terminalInput) {
    terminalInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = terminalInput.textContent.trim();
        terminalInput.textContent = '';
        
        if (cmd.length > 0) {
          executeTerminalCommand(cmd);
        }
      }
    });

    document.querySelector('.console-body').addEventListener('click', () => {
      terminalInput.focus();
    });
  }

  function appendTerminalLine(text, isOutput = true, isPrompt = false) {
    const line = document.createElement('div');
    line.className = 'line';
    if (isPrompt) {
      const prompt = document.createElement('span');
      prompt.className = 'prompt';
      prompt.textContent = 'foxdev@edge:~$';

      const output = document.createElement('span');
      output.className = 'output';
      output.textContent = ` ${text}`;

      line.append(prompt, output);
    } else if (isOutput) {
      line.className = 'line output';
      line.textContent = text;
    } else {
      line.textContent = text;
    }
    
    terminalLog.insertBefore(line, terminalInput.parentNode);
    terminalLog.parentNode.scrollTop = terminalLog.parentNode.scrollHeight;
  }

  function executeTerminalCommand(cmd) {
    appendTerminalLine(cmd, false, true);
    
    const cleanCmd = cmd.toLowerCase();
    
    if (cleanCmd === 'help') {
      appendTerminalLine('Comandos disponíveis:');
      appendTerminalLine('  help      - Exibe esta lista de ajuda.');
      appendTerminalLine('  status    - Exibe o status da infraestrutura Fox Development.');
      appendTerminalLine('  logs      - Exibe logs em tempo real do pipeline.');
      appendTerminalLine('  deploy    - Inicia simulação de deploy na Cloudflare.');
      appendTerminalLine('  clear     - Limpa o console.');
    } else if (cleanCmd === 'status') {
      appendTerminalLine('[INFO] Buscando telemetria da infraestrutura...');
      setTimeout(() => {
        appendTerminalLine('  - Cloudflare Pages: ATIVO (Latência média: 2.1ms)');
        appendTerminalLine('  - NestJS API Gateway: ONLINE (Uptime: 99.98%)');
        appendTerminalLine('  - Worker n8n Automations: ONLINE (12 active hooks)');
        appendTerminalLine('  - Sensores IoT Integrados: 1,480 nós comunicando');
      }, 350);
    } else if (cleanCmd === 'logs') {
      appendTerminalLine('[START] Monitorando logs de execução em tempo real...');
      let counter = 0;
      const interval = setInterval(() => {
        if (counter >= 6) {
          clearInterval(interval);
          appendTerminalLine('[INFO] Fim da transmissão de logs.');
          return;
        }
        const time = new Date().toISOString().split('T')[1].slice(0, 8);
        const logMsgs = [
          `[${time}] [n8n-engine] Executando workflow: SyncTelemetryDB`,
          `[${time}] [NestJS] GET /api/v1/telemetry/nodes - 200 OK (1.2ms)`,
          `[${time}] [IoT-Node-04] Transmissão de pacotes concluída: 124 bytes`,
          `[${time}] [Cloudflare] Cache PURGE solicitado via webhook`,
          `[${time}] [Database] Escrita bem sucedida na tabela sensor_logs`,
          `[${time}] [n8n-engine] Workflow SyncTelemetryDB finalizado`
        ];
        appendTerminalLine(logMsgs[counter]);
        counter++;
      }, 500);
    } else if (cleanCmd === 'deploy') {
      appendTerminalLine('[DEPLOY] Iniciando pipeline de deploy contínuo...');
      appendTerminalLine('  -> Clonando repositório Fox...');
      setTimeout(() => {
        appendTerminalLine('  -> Resolvendo dependências (JAMstack enxuto)...');
      }, 300);
      setTimeout(() => {
        appendTerminalLine('  -> Minificando assets HTML/CSS/JS...');
      }, 600);
      setTimeout(() => {
        appendTerminalLine('  -> Fazendo upload para Cloudflare CDN Edge...');
      }, 950);
      setTimeout(() => {
        appendTerminalLine('[OK] Deploy concluído com sucesso!');
        appendTerminalLine('  URL: https://foxdevelopment.dev (Nó: GRU-01)');
      }, 1400);
    } else if (cleanCmd === 'clear') {
      const lines = terminalLog.querySelectorAll('.line');
      lines.forEach(line => {
        if (line !== terminalInput.parentNode) {
          line.remove();
        }
      });
    } else {
      appendTerminalLine(`Comando desconhecido: "${cmd}". Digite "help" para ver a lista de comandos.`);
    }
  }

  const leadForm = document.getElementById('lead-form');
  const formSuccess = document.getElementById('form-success');

  if (leadForm) {
    leadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      const submitBtn = leadForm.querySelector('.btn-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Redirecionando...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      
      const formattedText = encodeURIComponent(
        `Olá! Meu nome é ${name} (${email}). Gostaria de solicitar um orçamento para o meu projeto:\n\n${message}`
      );
      const whatsappUrl = `https://wa.me/5531995124519?text=${formattedText}`;
      
      setTimeout(() => {
        const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (whatsappWindow) {
          whatsappWindow.opener = null;
        }
        leadForm.style.display = 'none';
        formSuccess.style.display = 'flex';
      }, 1000);
    });
  }

  const deviceSelectorBtns = document.querySelectorAll('.selector-btn');
  const screenContents = document.querySelectorAll('.screen-content');

  deviceSelectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      
      deviceSelectorBtns.forEach(b => b.classList.remove('active'));
      screenContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetScreen = document.getElementById(`screen-${targetView}`);
      if (targetScreen) {
        targetScreen.classList.add('active');
      }
    });
  });

  const tiltDevices = document.querySelectorAll('.laptop-mockup, .phone-mockup');
  tiltDevices.forEach(device => {
    device.addEventListener('mousemove', e => {
      const rect = device.getBoundingClientRect();
      const deviceWidth = rect.width;
      const deviceHeight = rect.height;
      const centerX = rect.left + deviceWidth / 2;
      const centerY = rect.top + deviceHeight / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateX = (-1 * (mouseY / (deviceHeight / 2)) * 8).toFixed(2);
      const rotateY = ((mouseX / (deviceWidth / 2)) * 8).toFixed(2);

      const currentScale = device.classList.contains('phone-mockup') ? '1.05' : '1.02';
      device.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${currentScale}, ${currentScale}, ${currentScale})`;
    });

    device.addEventListener('mouseleave', () => {
      device.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  const scrollRevealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-fade, .scroll-reveal-up');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  scrollRevealElements.forEach(el => {
    revealObserver.observe(el);
  });

  const kpiCards = document.querySelectorAll('.kpi-card');
  kpiCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  const zoomTriggers = document.querySelectorAll('.zoom-trigger');
  const dbOverlay = document.getElementById('dashboard-overlay');
  const overlayContent = document.getElementById('overlay-content');
  const overlayClose = document.getElementById('overlay-close');

  const kpiData = {
    revenue: {
      title: 'Faturamento Operacional',
      value: 'R$ 1.48M',
      desc: 'Integração consolidada de faturamento em tempo real através de APIs Stripe e gateways de pagamento descentralizados. Exibe o fluxo financeiro gerado por assinaturas SaaS de monitoramento industrial.'
    },
    uptime: {
      title: 'Disponibilidade de Rede (Uptime)',
      value: '99.998%',
      desc: 'Taxa de disponibilidade agregada de nossos nós distribuídos em redes de borda global. Redundância em tempo real com failover automático e detecção proativa de anomalias de hardware.'
    },
    nodes: {
      title: 'Sensores e Nós IoT Ativos',
      value: '14,802',
      desc: 'Quantidade total de dispositivos físicos autorizados transmitindo pacotes de dados de telemetria simultaneamente. Provisionamento de chaves via protocolo seguro de borda e autenticação criptográfica.'
    }
  };

  zoomTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const key = trigger.getAttribute('data-kpi');
      const data = kpiData[key];
      if (data && dbOverlay && overlayContent) {
        overlayContent.innerHTML = `
          <div class="kpi-icon" style="margin: 0 auto 16px auto; width: 60px; height: 60px; font-size: 1.5rem;">
            ${trigger.querySelector('.kpi-icon').innerHTML}
          </div>
          <h3>${data.title}</h3>
          <div class="large-val">${data.value}</div>
          <p>${data.desc}</p>
        `;
        dbOverlay.classList.add('active');
      }
    });
  });

  if (overlayClose && dbOverlay) {
    overlayClose.addEventListener('click', () => {
      dbOverlay.classList.remove('active');
    });
  }

  const simulateBtn = document.getElementById('simulate-growth-btn');
  if (simulateBtn) {
    let isSimulated = false;

    const baseData = [
      { val: 1842500, simVal: 2118875, pct: 14.2, simPct: 22.1 },
      { val: -165825, simVal: -190699, pct: -1.1, simPct: -1.5 },
      { val: 1676675, simVal: 1928176, pct: 12.8, simPct: 20.2 },
      { val: -78420, simVal: -82341, pct: 5.4, simPct: 7.2 },
      { val: -114800, simVal: -123984, pct: -8.2, simPct: -9.5 },
      { val: 1483455, simVal: 1721851, pct: 18.4, simPct: 28.4 },
      { val: 88.47, simVal: 89.30, pct: 2.4, simPct: 3.2 }
    ];

    function formatCurrency(v) {
      const isNegative = v < 0;
      const absV = Math.abs(v);
      const str = absV.toLocaleString('pt-BR');
      return isNegative ? `-R$ ${str}` : `R$ ${str}`;
    }

    function animateValue(el, start, end, duration, isPctVal) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + progress * (end - start);
        if (isPctVal) {
          el.textContent = `${current.toFixed(2)}%`;
        } else {
          el.textContent = formatCurrency(Math.round(current));
        }
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }

    simulateBtn.addEventListener('click', () => {
      isSimulated = !isSimulated;
      simulateBtn.classList.toggle('active');
      simulateBtn.innerHTML = isSimulated 
        ? '<i class="fa-solid fa-rotate-left"></i> Resetar DRE' 
        : '<i class="fa-solid fa-chart-line"></i> Simular +15%';

      const valEls = document.querySelectorAll('.dre-val');
      const pctEls = document.querySelectorAll('.dre-pct');

      valEls.forEach((el, index) => {
        const item = baseData[index];
        const start = isSimulated ? item.val : item.simVal;
        const end = isSimulated ? item.simVal : item.val;
        const isPctVal = el.getAttribute('data-is-pct') === 'true';

        el.classList.add('highlight-change');
        animateValue(el, start, end, 500, isPctVal);
        setTimeout(() => el.classList.remove('highlight-change'), 600);
      });

      pctEls.forEach((el, index) => {
        const item = baseData[index];
        const start = isSimulated ? item.pct : item.simPct;
        const end = isSimulated ? item.simPct : item.pct;
        
        const prefix = end > 0 ? '+' : '';
        el.textContent = `${prefix}${end.toFixed(1)}%`;
        
        if (end < 0 && index !== 1) {
          el.className = 'text-right text-danger dre-pct';
        } else if (end > 0) {
          el.className = 'text-right text-success dre-pct';
        } else {
          el.className = 'text-right text-neutral dre-pct';
        }
      });
    });
  }

  const n8nNodes = document.querySelectorAll('.n8n-node');
  const nodeStatusTexts = {
    1: { active: '<i class="fa-solid fa-circle-check text-success"></i> 200 OK (1.2ms)', paused: '<i class="fa-solid fa-circle-pause text-warning"></i> Pausado' },
    2: { active: '<i class="fa-solid fa-circle-check text-success"></i> Parsed 1.48k/s', paused: '<i class="fa-solid fa-circle-pause text-warning"></i> Pausado' },
    3: { active: '<i class="fa-solid fa-circle-check text-success"></i> Synced (0.8ms)', paused: '<i class="fa-solid fa-circle-pause text-warning"></i> Pausado' }
  };

  n8nNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nodeId = node.getAttribute('data-node');
      node.classList.toggle('node-paused');
      const isPaused = node.classList.contains('node-paused');

      const statusEl = document.getElementById(`status-node-${nodeId}`);
      if (statusEl) {
        statusEl.innerHTML = isPaused ? nodeStatusTexts[nodeId].paused : nodeStatusTexts[nodeId].active;
      }

      if (nodeId === '1') {
        const conn = document.getElementById('n8n-connector-1');
        if (conn) conn.classList.toggle('paused', isPaused);
      } else if (nodeId === '2') {
        const conn = document.getElementById('n8n-connector-2');
        if (conn) conn.classList.toggle('paused', isPaused);
      }
    });
  });

  const detailsTabBtns = document.querySelectorAll('.details-tab-btn');
  detailsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-details-tab');
      
      detailsTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const n8nArea = document.getElementById('details-tab-content-n8n');
      const barsArea = document.getElementById('details-tab-content-bars');
      if (n8nArea && barsArea) {
        n8nArea.style.display = targetTab === 'n8n' ? 'block' : 'none';
        barsArea.style.display = targetTab === 'bars' ? 'block' : 'none';
      }
    });
  });

  const barRows = document.querySelectorAll('.interactive-bar-row');
  const avgLoadEl = document.getElementById('average-edge-load');
  const loadStatusEl = document.getElementById('load-status-msg');

  function updateAverageLoad() {
    let total = 0;
    const pcts = document.querySelectorAll('.region-pct');
    pcts.forEach(el => {
      total += parseInt(el.textContent, 10);
    });
    const avg = Math.round(total / pcts.length);
    if (avgLoadEl && loadStatusEl) {
      avgLoadEl.textContent = `${avg}%`;
      
      if (avg < 50) {
        avgLoadEl.className = 'text-success';
        loadStatusEl.className = 'text-success';
        loadStatusEl.textContent = 'Eficiente';
      } else if (avg < 80) {
        avgLoadEl.className = 'text-warning';
        loadStatusEl.className = 'text-warning';
        loadStatusEl.textContent = 'Carga Moderada';
      } else {
        avgLoadEl.className = 'text-danger';
        loadStatusEl.className = 'text-danger';
        loadStatusEl.textContent = 'Sobrecarga Edge';
      }
    }
  }

  barRows.forEach(row => {
    const track = row.querySelector('.bar-slider-track');
    const fill = row.querySelector('.bar-slider-fill');
    const pctLabel = row.querySelector('.region-pct');
    const btnDec = row.querySelector('.val-decrease');
    const btnInc = row.querySelector('.val-increase');

    function setBarValue(val) {
      const clampedVal = Math.max(0, Math.min(100, val));
      if (fill && pctLabel) {
        fill.style.width = `${clampedVal}%`;
        pctLabel.textContent = `${clampedVal}%`;
        updateAverageLoad();
      }
    }

    if (track) {
      track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const width = rect.width;
        const newPct = Math.round((offsetX / width) * 100);
        setBarValue(newPct);
      });
    }

    if (btnDec) {
      btnDec.addEventListener('click', () => {
        const current = parseInt(pctLabel.textContent, 10);
        setBarValue(current - 5);
      });
    }

    if (btnInc) {
      btnInc.addEventListener('click', () => {
        const current = parseInt(pctLabel.textContent, 10);
        setBarValue(current + 5);
      });
    }
  });
})();
