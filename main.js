if (window.AOS) { try { AOS.init(); } catch(e){} }
if (window.feather) { try { feather.replace(); } catch(e){} }

// Toggle folder open/close
function toggleFolder(element) {
    const folderItem = element.parentElement;
    folderItem.classList.toggle('open');
    feather.replace();
}

// Panel switching: Terminal <-> Skills <-> Projects (same area/size)
function showPanel(panel) {
    const title = document.getElementById('panel-title');
    const t = document.getElementById('terminal-body');
    const s = document.getElementById('skills-panel');
    const p = document.getElementById('projects-panel');
    [t, s, p].forEach(el => el && el.classList.add('hidden'));
    if (panel === 'skills') {
        s.classList.remove('hidden');
        title.textContent = 'tech_stack@portfolio: ~';
    } else if (panel === 'projects') {
        p.classList.remove('hidden');
        title.textContent = 'projects@portfolio: ~';
    } else {
        t.classList.remove('hidden');
        title.textContent = 'portfolio_explorer@terminal: ~';
        focusCommandInput && focusCommandInput();
    }
}

// Show content request mapping
function showContent(type) {
    if (type === 'tech' || type === 'skills') {
        showPanel('skills');
    } else if (type === 'projects') {
        showPanel('projects');
        showProjectType('all');
    } else if (type === 'software') {
        showPanel('projects');
        showProjectType('software');
    } else if (type === 'ai') {
        showPanel('projects');
        showProjectType('ai');
    }
    if (window.feather) { try { feather.replace(); } catch(e){} }
}


// Close modal (legacy; not used after inline panels but kept safe)
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Focus the contenteditable terminal input
function focusCommandInput(){ const el=document.getElementById('command-input'); if(el){ el.focus(); } }

// Show a small help block at terminal start
function showTerminalInstructions(){
  const terminalBody=document.getElementById('terminal-body');
  if(!terminalBody) return;
  const block=document.createElement('div');
  block.className='terminal-line output text-gray-300';
  block.innerHTML=`Tip: try commands below and press Enter<br>
  - show tech  • open Skills<br>
  - show projects  • open Projects<br>
  - show software  • Software tab<br>
  - show ai  • AI tab<br>
  - help • list commands, clear • clear screen`;
  terminalBody.appendChild(block);
  terminalBody.scrollTop=terminalBody.scrollHeight;
}

// Project view switching and terminal title sync
function showProjectType(type) {
    const title = document.getElementById('panel-title');
    if (title) {
        if (type === 'software') title.textContent = 'software_projects@portfolio: ~';
        else if (type === 'ai') title.textContent = 'ai_projects@portfolio: ~';
        else title.textContent = 'projects@portfolio: ~';
    }

    const softwareSection = document.getElementById('software-projects');
    const aiSection = document.getElementById('ai-projects');
    const tabs = document.querySelector('#projects-panel .flex.border-b');

    [softwareSection, aiSection].forEach(section => {
        if (section) {
            section.classList.add('hidden');
        }
    });

    if (type === 'software') {
        if (softwareSection) {
            softwareSection.classList.remove('hidden');
        }
    } else if (type === 'ai') {
        if (aiSection) {
            aiSection.classList.remove('hidden');
        }
    } else {
        if (softwareSection) softwareSection.classList.remove('hidden');
        if (aiSection) aiSection.classList.remove('hidden');
    }

    if (tabs) tabs.style.display = 'none';
}

// Terminal command handling
document.getElementById('command-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const command = this.textContent.trim().toLowerCase();
        processCommand(command);
        this.textContent = '';
    }
});

// Utility: move caret to end of contenteditable
function setEndOfContenteditable(el){
    try{
        const range=document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel=window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }catch(_){}
}

// Utility: is terminal visible (not hidden)
function isTerminalVisible(){
    const t=document.getElementById('terminal-body');
    return t && !t.classList.contains('hidden');
}

// Global key routing: type anywhere to the terminal input
window.addEventListener('keydown', function(e){
    const el=document.getElementById('command-input');
    if(!el || !isTerminalVisible()) return;
    const active=document.activeElement;
    const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    const special = ['Backspace','Enter','Tab'];
    if (active === el) return; // native handling when already focused
    if (!printable && !special.includes(e.key)) return;

    // Route to terminal
    e.preventDefault();
    el.focus();
    if (printable){
        el.textContent += e.key;
    } else if (e.key === 'Backspace'){
        el.textContent = el.textContent.slice(0,-1);
    } else if (e.key === 'Enter'){
        const command = el.textContent.trim().toLowerCase();
        processCommand(command);
        el.textContent = '';
    }
    setEndOfContenteditable(el);
}, true);

function processCommand(command) {
    const terminalBody = document.getElementById('terminal-body');

    // Add command line to terminal
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-line';
    commandLine.innerHTML = `
        <span class="prompt">visitor@portfolio:~$</span>
        <span class="command"> ${command}</span>
    `;
    terminalBody.appendChild(commandLine);

    // Process command
    let outputLine;
    if (command === 'show tech' || command === 'cat tech_stack') {
        showContent('tech');
        return;
    } else if (command === 'show projects' || command === 'ls projects') {
        showContent('projects');
        return;
    } else if (command === 'show software') {
        showContent('software');
        return;
    } else if (command === 'show ai') {
        showContent('ai');
        return;
    } else if (command === 'whoami') {
        // Stay in terminal; print role-specific info
        outputLine = document.createElement('div');
        outputLine.className = 'terminal-line output';
        outputLine.textContent = 'You are exploring the portfolio.';
    } else if (command === 'help' || command === '') {
        outputLine = document.createElement('div');
        outputLine.className = 'terminal-line output';
        outputLine.innerHTML = `
            Available commands:<br>
            - show tech : Display technical skills<br>
            - show projects : Browse projects<br>
            - show software : View software projects<br>
            - show ai : View AI projects<br>
            - whoami : Show user information<br>
            - help : Show this help message<br>
            - clear : Clear terminal
        `;
    } else if (command === 'clear') {
        terminalBody.innerHTML = '';
        return;
    } else {
        outputLine = document.createElement('div');
        outputLine.className = 'terminal-line output';
        outputLine.textContent = `Command not found: ${command}. Type 'help' for available commands.`;
    }

    if (outputLine) {
        terminalBody.appendChild(outputLine);
    }
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Render AI recruiter skills with floating logos and Linux vibe with floating logos and Linux vibe
function renderAiSkillsPanel(panel){
    const logos = {
      python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      sql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      pytorch: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
      huggingface: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
      tensorflow: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
      sklearn: "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg",
      pandas: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
      numpy: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
      opencv: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg",
      node: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      azure: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",
      docker: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      gcp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
      tensorboard: "https://upload.wikimedia.org/wikipedia/commons/1/11/TensorFlowLogo.svg",
      linux: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
      calculus: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%230c172b'/><path d='M20 18h24l-8 28h-8l-8-28z' fill='none' stroke='%2339ff88' stroke-width='4' stroke-linejoin='round'/><path d='M24 26h16' stroke='%2339ff88' stroke-width='3.5' stroke-linecap='round'/><path d='M26 34h12' stroke='%2339ff88' stroke-width='3.5' stroke-linecap='round'/></svg>",
      linear_algebra: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%230c172b'/><g stroke='%2339ff88' stroke-width='3.5' stroke-linecap='round'><line x1='18' y1='18' x2='18' y2='46'/><line x1='32' y1='18' x2='32' y2='46'/><line x1='46' y1='18' x2='46' y2='46'/><line x1='18' y1='18' x2='46' y2='18'/><line x1='18' y1='32' x2='46' y2='32'/><line x1='18' y1='46' x2='46' y2='46'/></g><circle cx='32' cy='32' r='6' fill='%2339ff88'/></svg>"
    };

    const skillGroups = [
      {
        title: 'Languages',
        items: [
          { name: 'Python', key: 'python' },
          { name: 'SQL', key: 'sql' },
          { name: 'Java', key: 'java' }
        ]
      },
      {
        title: 'Libraries & Frameworks',
        items: [
          { name: 'PyTorch', key: 'pytorch' },
          { name: 'HuggingFace', key: 'huggingface' },
          { name: 'TensorFlow', key: 'tensorflow' },
          { name: 'Scikit-learn', key: 'sklearn' },
          { name: 'Pandas', key: 'pandas' },
          { name: 'NumPy', key: 'numpy' },
          { name: 'OpenCV', key: 'opencv' },
          { name: 'Node.js', key: 'node' }
        ]
      },
      {
        title: 'Tools',
        items: [
          { name: 'Azure', key: 'azure' },
          { name: 'Docker', key: 'docker' },
          { name: 'Google Cloud Platform', key: 'gcp' },
          { name: 'TensorBoard', key: 'tensorboard' },
          { name: 'Linux', key: 'linux' }
        ]
      },
      {
        title: 'Mathematics',
        items: [
          { name: 'Calculus', key: 'calculus' },
          { name: 'Linear Algebra', key: 'linear_algebra' }
        ]
      }
    ];

    const academicHighlights = [
      {
        title: 'AI & Data Science',
        modules: [
          {
            name: 'Machine Learning',
            level: 'Masters',
            icon: 'cpu',
            skills: 'Developed advanced deep learning models and mastered statistical pattern recognition for real-world AI deployment.',
            grade: 'Mark: 75 (Distinction)'
          },
          {
            name: 'Intelligent Data Analysis',
            level: 'Masters',
            icon: 'database',
            skills: 'Designed intelligent pipelines, engineered feature extraction strategies, and automated decision-making insights for stakeholders.',
            grade: 'Mark: 73 (Distinction)'
          },
          {
            name: 'Natural Language Processing',
            level: 'Masters',
            icon: 'message-square',
            skills: 'Built production-ready transformers, sentiment engines, and dialogue systems tuned for multilingual business scenarios.',
            grade: 'Mark: 76 (Distinction)'
          },
          {
            name: 'Neural Computation',
            level: 'Masters',
            icon: 'activity',
            skills: 'Explored biologically inspired learning, optimised neural architectures, and benchmarked spiking networks for adaptive control.',
            grade: 'Mark: 78 (High Distinction)'
          },
          {
            name: 'Evolutionary Computation',
            level: 'Masters',
            icon: 'trending-up',
            skills: 'Applied genetic algorithms and swarm intelligence to optimize complex systems and deliver explainable AI solutions.',
            grade: 'Mark: 72 (Distinction)'
          }
        ]
      },
      {
        title: 'Software Engineering',
        modules: [
          {
            name: 'Software Engineering & Professional Practice',
            level: 'Masters',
            icon: 'layers',
            skills: 'Led agile delivery squads, hardened CI/CD pipelines, and embedded secure coding standards across enterprise services.',
            grade: 'Mark: 74 (Distinction)'
          },
          {
            name: 'Operating Systems',
            level: 'Honours',
            icon: 'server',
            skills: 'Engineered kernel modules, fine-tuned concurrency primitives, and profiled system calls for high-throughput workloads.',
            grade: 'Mark: 70 (Merit)'
          },
          {
            name: 'Advanced Networking',
            level: 'Honours',
            icon: 'link',
            skills: 'Built resilient network simulations, implemented SDN controllers, and optimised QoS for distributed applications.',
            grade: 'Mark: 71 (Merit)'
          },
          {
            name: 'Functional Programming',
            level: 'Honours',
            icon: 'code',
            skills: 'Mastered immutable architectures, declarative design, and type-safe abstractions for mission-critical fintech workloads.',
            grade: 'Mark: 73 (Distinction)'
          },
          {
            name: 'Mobile & Ubiquitous Computing',
            level: 'Masters',
            icon: 'smartphone',
            skills: 'Delivered context-aware mobile apps, optimised edge synchronisation, and architected responsive UX for wearable tech.',
            grade: 'Mark: 75 (Distinction)'
          },
          {
            name: 'Project - Masters',
            level: 'Masters',
            icon: 'award',
            skills: 'Directed a cross-functional innovation project, integrating AI services, cloud infrastructure, and stakeholder reporting dashboards.',
            grade: 'Mark: 80 (High Distinction)'
          }
        ]
      },
      {
        title: 'Vision & Interaction',
        modules: [
          {
            name: 'Computer Vision and Imaging',
            level: 'Masters',
            icon: 'aperture',
            skills: 'Implemented multi-stage vision pipelines, accelerated inference on GPU, and deployed explainable detection systems.',
            grade: 'Mark: 74 (Distinction)'
          },
          {
            name: 'Intelligent Interactive Systems',
            level: 'Masters',
            icon: 'users',
            skills: 'Crafted adaptive interfaces, ran human-centred studies, and embedded reinforcement learning for personalised guidance.',
            grade: 'Mark: 77 (High Distinction)'
          }
        ]
      },
      {
        title: 'Mathematics',
        modules: [
          {
            name: 'Calculus',
            level: 'Undergraduate',
            icon: 'book-open',
            skills: 'Mastered the mathematical foundations powering modern AI algorithms and optimised continuous optimisation routines.',
            grade: 'Mark: 78 (High Distinction)'
          },
          {
            name: 'Linear Algebra',
            level: 'Undergraduate',
            icon: 'grid',
            skills: 'Decomposed large-scale matrices, tuned eigenvalue methods, and accelerated vectorised pipelines for ML production.',
            grade: 'Mark: 76 (Distinction)'
          }
        ]
      }
    ];

    function tile(name, key){
        const img = logos[key] || '';
        const imgTag = img ? `<img class="ai-skill-logo" src="${img}" alt="${name}">` : `<div class="ai-chip">${name}</div>`;
        return `<div class="ai-skill-tile" onclick="gotoSkillProjects('${key || name.toLowerCase()}')">${imgTag}<div class="mt-2 text-sm">${name}</div></div>`;
    }

    const moduleCard = (module) => `
      <article class="academic-card">
        <div class="academic-card-header">
          <span class="academic-card-icon"><i data-feather="${module.icon}"></i></span>
          <div>
            <h4 class="academic-card-title">${module.name}</h4>
            <p class="academic-card-level">${module.level}</p>
          </div>
        </div>
        <p class="academic-card-text">${module.skills}</p>
        <div class="academic-card-grade">${module.grade}</div>
      </article>
    `;

    const skillsHtml = skillGroups.map(group => `
          <div class="mb-6">
            <div class="ai-section-title">${group.title}</div>
            <div class="ai-skill-grid">
              ${group.items.map(item => tile(item.name, item.key)).join('')}
            </div>
          </div>
        `).join('');

    const academicHtml = academicHighlights.map(category => `
        <div class="academic-category">
          <h3 class="academic-category-title">${category.title}</h3>
          <div class="academic-card-grid">
            ${category.modules.map(moduleCard).join('')}
          </div>
        </div>
      `).join('');

    const html = `
        <div class="p-6">
          <h2 class="text-2xl font-bold text-green-400 mb-6">Skills</h2>
          ${skillsHtml}
          <section class="academic-section">
            <h2 class="text-2xl font-bold text-green-400 mb-4">Academic Highlights</h2>
            <p class="academic-intro text-gray-300 mb-6">A snapshot of the most employable modules from my university journey, each translating academic rigour into practical impact.</p>
            ${academicHtml}
          </section>
        </div>
    `;

    panel.innerHTML = html;

    if (window.feather) {
        try {
            feather.replace();
        } catch (error) {
            console.error(error);
        }
    }
}

function initializeSkillsPanel() {
    const panel = document.getElementById('skills-panel');
    if (panel) {
        renderAiSkillsPanel(panel);
    }
}

const aiTechIconMap = {
    'pytorch': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
    'whisper': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    'openai whisper': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    'huggingface': 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
    'numpy': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',
    'opencv': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
    'fastapi': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
    'docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'azure': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
    'kotlin': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    'node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'nodejs': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'postgresql': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    'stripe': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Stripe_Logo%2C_revised_2016.svg',
    'github': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    'react': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'mongodb': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    'redis': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    'vue': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    'vue.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    'firebase': 'https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg',
    'tailwind': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
    'tailwindcss': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
    'vite': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg',
    'nvidia': 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/2560px-Nvidia_logo.svg.png',
    'python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'
};

const projectModal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const modalHeroImg = document.getElementById('modal-hero-img');
const modalTech = document.getElementById('modal-tech');
const modalDescription = document.getElementById('modal-description');
const modalDetails = document.getElementById('modal-details');
const modalCloseBtn = projectModal ? projectModal.querySelector('.modal-close') : null;

function normalizeTechName(name) {
    return (name || '').toLowerCase().trim();
}

function renderTechIcons(container, stack) {
    if (!container) return;
    container.innerHTML = '';
    (stack || []).forEach(name => {
        const iconSrc = aiTechIconMap[normalizeTechName(name)] || aiTechIconMap[normalizeTechName(name).replace(/\s+/g, '')];
        if (iconSrc) {
            const img = document.createElement('img');
            img.src = iconSrc;
            img.alt = name + ' logo';
            container.appendChild(img);
        } else {
            const badge = document.createElement('span');
            badge.className = 'pill';
            badge.textContent = name;
            container.appendChild(badge);
        }
    });
}

function escapeHtml(str = '') {

    return str

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;');

}



function formatMarkdown(text = '') {

    const codeBlocks = [];

    let working = text.replace(/```([\s\S]*?)```/g, (_, code) => {

        codeBlocks.push(code);

        return `@@CODE_BLOCK_${codeBlocks.length - 1}@@`;

    });



    working = escapeHtml(working)

        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

        .replace(/`([^`]+)`/g, '<code>$1</code>')

        .replace(/\r?\n/g, '<br>');



    return working.replace(/@@CODE_BLOCK_(\d+)@@/g, (_, idx) => {

        const code = escapeHtml(codeBlocks[idx] || '');

        return `<pre><code>${code}</code></pre>`;

    });

}



function buildAiProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'case-card cursor-pointer';
    card.setAttribute('data-aos', 'fade-up');

    const media = document.createElement('div');
    media.className = 'case-media';
    const img = document.createElement('img');
    img.src = project.image || '';
    img.alt = `${project.name || 'AI project'} visuals`;
    media.appendChild(img);
    card.appendChild(media);

    const title = document.createElement('div');
    title.className = 'case-title';
    title.textContent = project.name || '';
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'case-desc';
    desc.innerHTML = formatMarkdown(project.description || '');
    card.appendChild(desc);

    const techHolder = document.createElement('div');
    techHolder.className = 'tech-logo-grid';
    renderTechIcons(techHolder, project.tech_stack);
    card.appendChild(techHolder);

    card.addEventListener('click', () => openProjectModal(project));
    return card;
}

function openProjectModal(project) {
    if (!projectModal) return;
    modalTitle.textContent = project.name || '';
    if (project.image) {
        modalHeroImg.src = project.image;
        modalHeroImg.alt = project.name + ' hero image';
    } else {
        modalHeroImg.removeAttribute('src');
        modalHeroImg.alt = '';
    }
    renderTechIcons(modalTech, project.tech_stack);
    modalDescription.innerHTML = formatMarkdown(project.description || '');
    modalDetails.innerHTML = '';
    (project.details || []).forEach((detail, index) => {
        const row = document.createElement('div');
        row.className = 'detail-row' + (index % 2 === 1 ? ' reverse' : '');

        const textWrap = document.createElement('div');
        textWrap.className = 'detail-text';
        const heading = document.createElement('h4');
        heading.textContent = detail.title || '';
        const paragraph = document.createElement('p');
        paragraph.innerHTML = formatMarkdown(detail.text || '');
        textWrap.appendChild(heading);
        textWrap.appendChild(paragraph);

        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'detail-media';
        if (detail.image) {
            const img = document.createElement('img');
            img.src = detail.image;
            img.alt = (detail.title || project.name || 'Project detail') + ' visual';
            mediaWrap.appendChild(img);
        }

        if (index % 2 === 1) {
            if (mediaWrap.childElementCount) {
                row.appendChild(mediaWrap);
            }
            row.appendChild(textWrap);
        } else {
            row.appendChild(textWrap);
            if (mediaWrap.childElementCount) {
                row.appendChild(mediaWrap);
            }
        }
        modalDetails.appendChild(row);
    });
    projectModal.classList.remove('hidden');
    projectModal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.add('hidden');
    projectModal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

async function loadAiProjects() {
    const list = document.getElementById('ai-projects-list');
    if (!list) return;
    try {
        const response = await fetch('aiproj.json');
        if (!response.ok) throw new Error('Failed to load AI projects');
        const projects = await response.json();
        if (!Array.isArray(projects)) throw new Error('Invalid AI project format');
        list.innerHTML = '';
        projects.forEach(project => {
            const card = buildAiProjectCard(project);
            list.appendChild(card);
        });
        if (projects.length === 0) {
            list.innerHTML = '<div class=\"text-sm text-gray-400\">No AI projects published yet.</div>';
        } else if (window.AOS && typeof window.AOS.refresh === 'function') {
            window.AOS.refresh();
        }
    } catch (error) {
        console.error(error);
        list.innerHTML = '<div class="text-sm text-red-400">Unable to load AI projects right now.</div>';
    }
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
}
if (projectModal) {
    projectModal.addEventListener('click', (event) => {
        if (event.target === projectModal) {
            closeProjectModal();
        }
    });
}
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectModal && !projectModal.classList.contains('hidden')) {
        closeProjectModal();
    }
});


// Initialize app when DOM is ready
window.onload = function() {
    initializeSkillsPanel();
    if (typeof loadAiProjects === 'function') {
        loadAiProjects();
    }
    if (window.feather) {
        try { feather.replace(); } catch (e) { console.error(e); }
    }
    if (window.AOS) {
        try { AOS.init(); } catch (e) { console.error(e); }
    }
    applyInitialViewFromUrl();
};

function applyInitialViewFromUrl() {
    const panelTitle = document.getElementById('panel-title');
    if (!panelTitle) {
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const type = params.get('type');

    if (view === 'projects') {
        showPanel('projects');
        if (type === 'ai') {
            showProjectType('ai');
        } else if (type === 'software') {
            showProjectType('software');
        } else {
            showProjectType('all');
        }
        return;
    }

    if (view === 'skills') {
        showPanel('skills');
        return;
    }

    showPanel('terminal');
    showTerminalInstructions();
}

// Navigate to projects for a given skill (placeholder wiring)
function gotoSkillProjects(slug){
    console.log('Open projects for skill:', slug);
    showPanel('projects');
    showProjectType('ai');
    // Future: filter/highlight projects by slug
}
















