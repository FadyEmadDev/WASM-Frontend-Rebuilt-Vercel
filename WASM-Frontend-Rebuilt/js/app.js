/*
  WASM Static Frontend
  Rebuilt from the original ASP.NET project as browser-only HTML/CSS/JavaScript.
  No .NET runtime, server API, build step, or framework is required.
*/
'use strict';
const PRODUCTS = Object.freeze([
  { slug: 'form', name: 'WASM FORM', description: 'Essential Protection', price: 45, colors: ['#092838', '#e6dfd0', '#121212'], image: 'form-main.jpg', collection: 'FORM Collection' },
  { slug: 'frame', name: 'WASM FRAME', description: 'Minimalist Bumper', price: 35, colors: ['#e9e8e3', '#43596e'], image: 'frame-main.jpg', collection: 'FRAME Collection' },
  { slug: 'core', name: 'WASM CORE', description: 'Maximum Durability', price: 55, colors: ['#050505', '#0d2a3a'], image: 'core-main.jpg', collection: 'CORE Collection' },
  { slug: 'silhouette', name: 'WASM SILHOUETTE', description: 'Ultra-Thin Profile', price: 40, colors: ['#f7fbfc', '#deddd8'], image: 'silhouette-main.jpg', collection: 'SILHOUETTE Collection' }
]);

const MOTION = Object.freeze({fast:180,ui:340,reveal:760,editorial:1000,stagger:70});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

function observeReveals(elements, options={}) {
  const list=[...elements].filter(el=>!el.dataset.motionBound);
  if(!list.length)return;
  list.forEach((el,index)=>{el.dataset.motionBound='true';el.classList.add('motion-reveal');if(options.type)el.dataset.motion=options.type;el.style.setProperty('--motion-delay',`${Math.min(index*(options.stagger??MOTION.stagger),280)}ms`)});
  if(reducedMotion){list.forEach(el=>el.classList.add('is-visible'));return}
  const targets=new Map();
  list.forEach(el=>{const target=options.type==='mask'?(el.parentElement??el):el;if(!targets.has(target))targets.set(target,[]);targets.get(target).push(el)});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){targets.get(entry.target)?.forEach(el=>el.classList.add('is-visible'));observer.unobserve(entry.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  targets.forEach((_,target)=>observer.observe(target));
}

function animateGrid(grid, mutate) {
  if(!grid||reducedMotion){mutate();return}
  const before=new Map([...grid.children].map(el=>[el,el.getBoundingClientRect()]));
  grid.classList.add('is-updating');mutate();
  [...grid.children].forEach(el=>{const old=before.get(el);if(!old)return;const now=el.getBoundingClientRect();const dx=old.left-now.left,dy=old.top-now.top;el.animate([{transform:`translate(${dx}px,${dy}px)`,opacity:.55},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'})});
  setTimeout(()=>grid.classList.remove('is-updating'),MOTION.ui);
}

function initPageEntrance(){document.documentElement.classList.add('motion-enhanced');document.body.classList.add('page-entering');requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.remove('page-entering')))}

function initNav(){
  const nav=document.querySelector('.site-nav');if(!nav)return;
  let lastY=scrollY,ticking=false;
  const update=()=>{const y=scrollY;nav.classList.toggle('is-scrolled',y>24);nav.classList.toggle('is-dimmed',y>180&&y>lastY+2);if(y<lastY-5)nav.classList.remove('is-dimmed');lastY=y;ticking=false};
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});update();
}

function initPageTransitions(){
  document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey)return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||link.target==='_blank'||url.hash&&url.pathname===location.pathname)return;event.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.href=url.href,reducedMotion?0:MOTION.fast)});
}

function initMagnetic(){if(!finePointer||reducedMotion)return;document.querySelectorAll('.hero .button,#add-to-bag,.device').forEach(el=>{el.classList.add('magnetic');el.addEventListener('pointermove',event=>{const rect=el.getBoundingClientRect();el.style.setProperty('--magnetic-x',`${(event.clientX-rect.left-rect.width/2)*.045}px`);el.style.setProperty('--magnetic-y',`${(event.clientY-rect.top-rect.height/2)*.06}px`)});el.addEventListener('pointerleave',()=>{el.style.setProperty('--magnetic-x','0px');el.style.setProperty('--magnetic-y','0px')})})}

function cartCount(){return Math.max(0,Number(localStorage.getItem('wasm-cart-count')||0))}
function setCartCount(count){localStorage.setItem('wasm-cart-count',String(Math.max(0,count)));document.dispatchEvent(new CustomEvent('wasm:cart-updated',{detail:{count:Math.max(0,count)}}))}

function cartMarkup(){return `<div class="cart-overlay" id="cart-overlay" aria-hidden="true"><aside class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag"><header class="cart-head"><h2>Your Bag</h2><button class="cart-close" aria-label="Close bag">×</button></header><div class="cart-body"></div><footer class="cart-foot"><div class="cart-subtotal"><span>Subtotal</span><strong>$0.00</strong></div><a class="button wide" href="checkout.html">Checkout</a></footer></aside></div>`}

function initCart(){
  document.body.insertAdjacentHTML('beforeend',cartMarkup());const overlay=document.querySelector('#cart-overlay'),body=overlay.querySelector('.cart-body'),subtotal=overlay.querySelector('.cart-subtotal strong');
  const render=()=>{const count=cartCount();body.innerHTML=count?`<article class="cart-item"><img src="assets/product-main.jpg" alt="WASM FORM Case"><div><h3>WASM FORM Case</h3><p>Sand Beige • iPhone 17 Pro Max</p><div class="quantity-control"><button data-qty="-1" aria-label="Decrease quantity">−</button><span>${count}</span><button data-qty="1" aria-label="Increase quantity">+</button></div></div><button class="cart-remove" aria-label="Remove product">×</button></article>`:`<p class="cart-empty">Your bag is ready for something tactile.</p>`;subtotal.classList.add('updating');setTimeout(()=>{subtotal.textContent=`$${(45*count).toFixed(2)}`;subtotal.classList.remove('updating')},reducedMotion?0:120);overlay.querySelector('.cart-foot').hidden=!count};
  const open=()=>{render();overlay.classList.add('is-open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('overlay-open');setTimeout(()=>overlay.querySelector('.cart-close').focus(),MOTION.fast)};
  const close=()=>{overlay.classList.remove('is-open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('overlay-open')};
  document.addEventListener('click',event=>{if(event.target.closest('[data-cart-open]')){event.preventDefault();open()}if(event.target===overlay||event.target.closest('.cart-close'))close();const qty=event.target.closest('[data-qty]');if(qty){setCartCount(cartCount()+Number(qty.dataset.qty));render()}const remove=event.target.closest('.cart-remove');if(remove){const item=remove.closest('.cart-item');item.classList.add('is-removing');setTimeout(()=>{setCartCount(0);render()},reducedMotion?0:360)}});
  document.addEventListener('wasm:cart-updated',event=>{document.querySelectorAll('.bag-count').forEach(el=>{el.textContent=event.detail.count;el.hidden=!event.detail.count;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')});render()});
  document.addEventListener('wasm:open-cart',open);addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay.classList.contains('is-open'))close()});render();
}

function initMobileMenu(){
  const button=document.querySelector('.menu-button');if(!button)return;const links=[['Shop','shop.html'],['iPhone 16','shop.html'],['iPhone 17','product.html'],['About','index.html#story'],['Contact','index.html#footer']];
  const menu=document.createElement('nav');menu.className='mobile-menu';menu.setAttribute('aria-label','Mobile navigation');menu.innerHTML=links.map(([label,href],i)=>`<a href="${href}" style="--i:${i}">${label}</a>`).join('');document.body.append(menu);
  const toggle=force=>{const open=force??!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);button.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));document.body.classList.toggle('overlay-open',open)};
  button.setAttribute('aria-expanded','false');button.addEventListener('click',()=>toggle());menu.addEventListener('click',event=>{if(event.target.closest('a'))toggle(false)});addEventListener('keydown',event=>{if(event.key==='Escape')toggle(false)});
}

function initFooter(){const footer=document.querySelector('.site-footer');if(!footer)return;observeReveals(footer.querySelectorAll('.footer-brand,.footer-col,.footer-bottom'),{stagger:80});const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){footer.style.setProperty('--footer-line','1');observer.disconnect()}},{threshold:.1});observer.observe(footer)}

function initMotion(page){
  initPageEntrance();initNav();initPageTransitions();initCart();initMobileMenu();initFooter();initMagnetic();
  ({home:initHomeMotion,shop:initShopMotion,product:initProductMotion,checkout:initCheckoutMotion}[page]??(()=>{}))();
}

function initHomeMotion(){
  const hero=document.querySelector('.hero');if(!hero)return;requestAnimationFrame(()=>hero.classList.add('is-loaded'));
  observeReveals(document.querySelectorAll('.section-heading>div,.section-heading>.text-link'),{stagger:90});
  observeReveals(document.querySelectorAll('.featured-card'),{stagger:90});
  observeReveals(document.querySelectorAll('.devices h2'),{type:'scale'});observeReveals(document.querySelectorAll('.device'),{type:'mask',stagger:75});
  observeReveals(document.querySelectorAll('.story>img'),{type:'mask'});observeReveals(document.querySelectorAll('.story>div'),{type:'right'});
  document.querySelectorAll('.featured-card .media,.story').forEach(el=>el.classList.add('motion-media'));
  if(reducedMotion)return;
  if(finePointer){hero.addEventListener('pointermove',event=>{const rect=hero.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;hero.style.setProperty('--hero-x',`${x*16}px`);hero.style.setProperty('--hero-y',`${y*10}px`);hero.style.setProperty('--hero-bg-x',`${x*-10}px`);hero.style.setProperty('--hero-bg-y',`${y*-7}px`);hero.style.setProperty('--hero-shadow-x',`${x*12}px`);hero.style.setProperty('--hero-content-x',`${x*3}px`);hero.style.setProperty('--hero-content-y',`${y*2}px`)},{passive:true});hero.addEventListener('pointerleave',()=>{['--hero-x','--hero-y','--hero-bg-x','--hero-bg-y','--hero-shadow-x','--hero-content-x','--hero-content-y'].forEach(prop=>hero.style.setProperty(prop,'0px'))})}
  const story=document.querySelector('.story img');let ticking=false;
  const scrollMotion=()=>{const heroRect=hero.getBoundingClientRect(),progress=Math.min(1,Math.max(0,-heroRect.top/heroRect.height));hero.style.setProperty('--hero-content-y',`${progress*-52}px`);hero.style.setProperty('--hero-content-scale',String(1-progress*.045));hero.style.setProperty('--hero-content-opacity',String(1-progress*1.2));hero.style.setProperty('--hero-light-scale',String(1+progress*.12));hero.style.setProperty('--hero-shadow-opacity',String(.2-progress*.15));if(story){const rect=story.getBoundingClientRect(),p=(innerHeight/2-(rect.top+rect.height/2))/innerHeight;story.style.setProperty('--story-parallax',`${Math.max(-18,Math.min(18,p*30))}px`)}ticking=false};
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollMotion);ticking=true}},{passive:true});scrollMotion();
}

function initShopMotion(){
  observeReveals(document.querySelectorAll('.shop-heading>div'),{stagger:100});observeReveals(document.querySelectorAll('.product-card'),{stagger:85});
  document.querySelectorAll('.product-card .media').forEach(el=>el.classList.add('motion-media'));
  const buttons=[...document.querySelectorAll('.filters button')].filter(button=>button.id!=='sort-button');if(!buttons.length)return;
  document.body.insertAdjacentHTML('beforeend',`<div class="filter-sheet-overlay" aria-hidden="true"><section class="filter-sheet" role="dialog" aria-modal="true" aria-label="Product filters"><header class="filter-sheet-head"><h3>Filter cases</h3><button class="filter-sheet-close" aria-label="Close filters">×</button></header><div class="filter-options"><button class="filter-option is-active" data-filter="all"><span>All cases</span><span>4</span></button><button class="filter-option" data-filter="dark"><span>Dark finishes</span><span>2</span></button><button class="filter-option" data-filter="light"><span>Light finishes</span><span>2</span></button></div><button class="button filter-apply">Apply filters</button></section></div>`);
  const overlay=document.querySelector('.filter-sheet-overlay'),sheet=overlay.querySelector('.filter-sheet');let selected='all';
  const open=()=>{overlay.classList.add('is-open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('overlay-open')},close=()=>{overlay.classList.remove('is-open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('overlay-open')};
  buttons.forEach(button=>button.addEventListener('click',open));overlay.addEventListener('click',event=>{if(event.target===overlay||event.target.closest('.filter-sheet-close'))close();const option=event.target.closest('.filter-option');if(option){overlay.querySelectorAll('.filter-option').forEach(item=>item.classList.remove('is-active'));option.classList.add('is-active');selected=option.dataset.filter}if(event.target.closest('.filter-apply')){const cards=[...document.querySelectorAll('.product-card')];cards.forEach((card,index)=>{const slug=['form','frame','core','silhouette'][index],show=selected==='all'||(selected==='dark'&&['form','core'].includes(slug))||(selected==='light'&&['frame','silhouette'].includes(slug));card.classList.add('is-filtering');setTimeout(()=>{card.hidden=!show;card.classList.remove('is-filtering')},reducedMotion?0:180)});close()}});addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay.classList.contains('is-open'))close()});
}

function initProductMotion(){
  observeReveals(document.querySelectorAll('.gallery-main'),{type:'mask'});observeReveals(document.querySelectorAll('.gallery-pair img,.gallery-life'),{type:'mask',stagger:90});observeReveals(document.querySelectorAll('.product-controls>*'),{type:'right',stagger:45});
  const gallery=document.querySelector('.gallery-main'),image=gallery?.querySelector('img');
  if(gallery&&image&&finePointer&&!reducedMotion){gallery.addEventListener('pointerenter',()=>{gallery.style.setProperty('--zoom-active','1');gallery.style.setProperty('--gallery-scale','1.045')});gallery.addEventListener('pointermove',event=>{const rect=gallery.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;gallery.style.setProperty('--zoom-x',`${x*100}%`);gallery.style.setProperty('--zoom-y',`${y*100}%`);gallery.style.setProperty('--gallery-x',`${(x-.5)*-7}px`);gallery.style.setProperty('--gallery-y',`${(y-.5)*-7}px`)});gallery.addEventListener('pointerleave',()=>{gallery.style.setProperty('--zoom-active','0');gallery.style.setProperty('--gallery-scale','1');gallery.style.setProperty('--gallery-x','0');gallery.style.setProperty('--gallery-y','0')})}
  const buy=document.querySelector('#add-to-bag');if(buy&&!buy.querySelector('.button-label'))buy.innerHTML='<span class="button-label">Add to bag</span>';
  if(innerWidth<=720&&buy){const bar=document.createElement('div');bar.className='mobile-sticky-buy';bar.innerHTML='<span>WASM FORM · EGP 1,490</span><button class="button">Add to bag</button>';document.body.append(bar);let hasSeen=false;const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){hasSeen=true;bar.classList.remove('is-visible')}else bar.classList.toggle('is-visible',hasSeen&&entry.boundingClientRect.top<0)},{threshold:0});observer.observe(buy);bar.querySelector('button').addEventListener('click',()=>buy.click())}
}

function initCheckoutMotion(){
  observeReveals(document.querySelectorAll('#checkout-form>section'),{stagger:70});observeReveals(document.querySelectorAll('.summary'),{type:'right'});
  document.querySelectorAll('.express button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.express button').forEach(item=>item.classList.remove('is-selected'));button.classList.add('is-selected')}));
  const form=document.querySelector('#checkout-form');form?.addEventListener('invalid',event=>{event.target.animate([{transform:'translateX(0)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'})},true);
}


const page = document.body.dataset.page;
if(new URLSearchParams(location.search).has('capture'))document.documentElement.classList.add('capture-mode');

const icons = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8h11l1 12h-13zM9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3"/><path d="M6.5 19c.5-4 2.5-6 5.5-6s5 2 5.5 6z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
};

function renderNav() {
  const host = document.querySelector('#nav');
  if (!host) return;
  const links = [['shop','shop.html','Shop'],['iphone16','shop.html?model=iphone16','iPhone 16'],['product','product.html','iPhone 17'],['about','index.html#story','About']];
  const requestedModel=new URLSearchParams(location.search).get('model');
  const activeId=page==='product'?'product':page==='shop'?(requestedModel==='iphone16'?'iphone16':'shop'):(page==='home'&&location.hash==='#story'?'about':'');
  host.innerHTML = `<nav class="site-nav"><div class="nav-inner container"><a class="brand" href="index.html">WASM</a><div class="nav-links">${links.map(([id,href,label]) => `<a data-nav="${id}" class="${activeId===id?'active':''}" ${activeId===id?'aria-current="page"':''} href="${href}">${label}</a>`).join('')}</div><div class="nav-actions"><a class="icon-button" data-cart-open href="checkout.html" aria-label="Shopping bag">${icons.bag}<span class="bag-count" hidden>0</span></a><span class="icon-button account-mark" aria-hidden="true">${icons.user}</span><button class="icon-button menu-button" aria-label="Menu">${icons.menu}</button></div></div></nav>`;
  updateBagCount();
}

function syncHomeNav(){
  if(page!=='home')return;
  const links=[...document.querySelectorAll('.nav-links [data-nav]')];
  const setActive=id=>links.forEach(link=>{const active=link.dataset.nav===id;link.classList.toggle('active',active);active?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current')});
  const story=document.querySelector('#story');if(!story)return;
  const update=()=>{const rect=story.getBoundingClientRect();setActive(rect.top<=innerHeight*.45&&rect.bottom>90?'about':'')};
  addEventListener('scroll',update,{passive:true});addEventListener('hashchange',update);update();
}

function renderFooter() {
  const host = document.querySelector('#footer');
  if (!host) return;
  host.innerHTML = `<footer class="site-footer"><div class="container"><div class="footer-top"><div class="footer-brand"><span class="brand">WASM</span><p>Engineered for the tactile world. Premium protection designed with architectural precision.</p></div><div class="footer-col"><b>Shop</b><a href="product.html">iPhone 17 Pro</a><a href="product.html">iPhone 17 Pro Max</a><a href="shop.html">iPhone 16 Pro</a><a href="shop.html">iPhone 16 Pro Max</a></div><div class="footer-col"><b>Support</b><a href="#">Shipping</a><a href="#">Returns</a><a href="#">Contact</a><a href="#">Warranty</a></div><div class="footer-col"><b>Legal</b><a href="#">Privacy</a><a href="#">Terms</a></div></div><div class="footer-bottom"><span>© 2024 WASM. Engineered for the tactile world.</span><span>Privacy&nbsp;&nbsp;&nbsp;&nbsp; Terms&nbsp;&nbsp;&nbsp;&nbsp; Shipping&nbsp;&nbsp;&nbsp;&nbsp; Contact</span></div></div></footer>`;
}

function getProducts() { return PRODUCTS; }

const imageFor = slug => `assets/${slug}-main.jpg`;

function renderProducts() {
  const products = getProducts();
  const featured = document.querySelector('#featured-products');
  const homeImages = {form:'assets/form-home.jpg',frame:'assets/frame-home.jpg',core:'assets/core-home.jpg'};
  if (featured) featured.innerHTML = products.slice(0,3).map(p => `<a class="featured-card" href="product.html"><div class="media"><img src="${homeImages[p.slug]}" alt="${p.name} phone case"><img class="alt-image" src="assets/${p.slug}-alt.jpg" alt="" aria-hidden="true"></div><div class="product-meta"><div><h3>${p.name}</h3><p>${p.slug==='form'?'Seamless silicone integration.':p.slug==='frame'?'Architectural edge protection.':'Maximum tactile response.'}</p></div><span>$${p.slug==='form'?'55':p.slug==='frame'?'65':'75'}</span></div></a>`).join('');
  const grid = document.querySelector('#product-grid');
  if (grid) grid.innerHTML = products.map(p => `<a class="product-card" href="product.html" data-price="${p.price}" data-name="${p.name}"><div class="media"><img src="${imageFor(p.slug)}" alt="${p.name} phone case"><img class="alt-image" src="assets/${p.slug}-alt.jpg" alt="" aria-hidden="true"></div><div class="product-meta"><div><h3>${p.name}</h3><p>${p.description}</p><div class="swatch-row">${p.colors.map(c=>`<i class="swatch-dot" style="background:${c}"></i>`).join('')}</div></div><span>$${p.price}</span></div></a>`).join('');
}

function productInteractions() {
  document.querySelectorAll('.model-grid button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.model-grid button').forEach(item => item.classList.remove('active')); button.classList.add('active');
  }));
  document.querySelectorAll('.swatches button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.swatches button').forEach(item => item.classList.remove('active')); button.classList.add('active');
    const label=document.querySelector('#color-name'),image=document.querySelector('#product-main-image');label.classList.add('is-changing');image.classList.add('is-changing');
    const filters={'Sand Beige':'none','Midnight Navy':'brightness(.58) saturate(1.15) hue-rotate(8deg)','Stone':'grayscale(.7) brightness(.82)','Ivory':'brightness(1.08) saturate(.55)'};
    setTimeout(()=>{label.textContent=button.dataset.color;label.classList.remove('is-changing');image.style.filter=filters[button.dataset.color];image.classList.remove('is-changing')},180);
  }));
  document.querySelector('#add-to-bag')?.addEventListener('click', () => {
    const button=document.querySelector('#add-to-bag'),label=button.querySelector('.button-label')??button;setCartCount(cartCount()+1);updateBagCount();
    label.textContent='Added ✓';button.classList.add('is-confirmed');
    const toast = document.querySelector('#toast'); toast.textContent='WASM FORM added to your bag'; toast.classList.add('show');
    setTimeout(()=>{toast.classList.remove('show');label.textContent='Add to bag';button.classList.remove('is-confirmed');document.dispatchEvent(new Event('wasm:open-cart'))},850);
  });
}

function updateBagCount(){const count=Number(localStorage.getItem('wasm-cart-count')||0);document.querySelectorAll('.bag-count').forEach(el=>{el.textContent=count;el.hidden=!count})}

function checkoutInteraction() {
  const form = document.querySelector('#checkout-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = document.querySelector('#checkout-status');
    const submitButton = form.querySelector('button[type="submit"]');

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = 'Please complete all required checkout fields.';
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = 'Processing your order…';
    submitButton.disabled = true;

    // Static-frontend receipt: preserves the original confirmation flow without a .NET API.
    const id = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

    const receipt = {
      id,
      createdAt: new Date().toISOString(),
      email: data.email,
      total: 48.60,
      status: 'confirmed'
    };

    localStorage.setItem('wasm-last-order', JSON.stringify(receipt));

    window.setTimeout(() => {
      setCartCount(0);
      updateBagCount();
      status.textContent = `Order confirmed — ${receipt.id.slice(0, 8).toUpperCase()}`;
    }, reducedMotion ? 0 : 450);
  });
}

function sortInteraction(){let mode=0;document.querySelector('#sort-button')?.addEventListener('click',event=>{const grid=document.querySelector('#product-grid');mode=(mode+1)%3;event.currentTarget.textContent=['Price ↑','Price ↓','Name ↑'][mode];animateGrid(grid,()=>{const cards=[...grid.children].sort((a,b)=>mode===0?Number(a.dataset.price)-Number(b.dataset.price):mode===1?Number(b.dataset.price)-Number(a.dataset.price):a.dataset.name.localeCompare(b.dataset.name));cards.forEach(card=>grid.append(card))})})}

function start(){
  renderNav();renderFooter();syncHomeNav();
  if(page==='home'||page==='shop'){renderProducts();sortInteraction()}
  if(page==='product')productInteractions();if(page==='checkout')checkoutInteraction();initMotion(page);
}

start();
