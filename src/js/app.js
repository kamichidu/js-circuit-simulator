(function(){
    'use strict';

    class Pool
    {
        constructor(opts)
        {
            opts || (opts= {});

            this._min= opts.min || 0;
            this._max= opts.max || 100;
            this._value= opts.value || this._min;
        }

        get min()
        {
            return this._min;
        }

        get max()
        {
            return this._max;
        }

        get value()
        {
            return this._value;
        }

        set value(value)
        {
            this._value= value;
            if(this._value < this.min)
            {
                this._value= this.min;
            }
            if(this._value > this.max)
            {
                this._value= this.max;
            }
        }
    }

    class Material
    {
        constructor()
        {
        }
    }

    class Environment
    {
        constructor(opts)
        {
            opts || (opts= {});

            this.pools= opts.pools || {};
            this.pools.ether= this.pools.ether || new Pool({
                min: -1000,
                max: 1000,
                value: 0
            });
            this.pools.mana= this.pools.mana || new Pool({
                min: 0,
                max: 1000,
                value: 0
            });
        }

        tick(dt)
        {
            this.pools.ether.value+= (20 * dt / 1000);
        }
    }

    class Looper
    {
        constructor(opts)
        {
            opts || (opts= {});

            this.fps= opts.fps || 60;
            this.defaultSleepMillis= 1000 / this.fps;
        }

        start(fun)
        {
            fun= this.attachProxy(fun);

            let beforeTime= new Date().getTime();
            let tick= () => {
                let currentTime= new Date().getTime();

                fun(currentTime - beforeTime);

                let sleepTime= this.defaultSleepMillis - (new Date().getTime() - currentTime);
                beforeTime= new Date().getTime();
                if(sleepTime > 0)
                {
                    setTimeout(tick, Math.floor(sleepTime));
                }
                else
                {
                    tick();
                }
            };
            setTimeout(tick, 0);
        }

        attachProxy(fun)
        {
            return (...args) => {
                return fun.apply(undefined, args);
            };
        }

        get currentFPS()
        {
            return 0;
        }
    }

    class DebugMonitor
    {
        constructor(opts)
        {
            opts || (opts= {});

            this.el= opts.el;
            this.refresh= opts.refresh;
            this.intervalMillis= opts.intervalMillis || 1000;
            this.intervalId= null;
        }

        enable()
        {
            if(this.intervalId)
            {
                return;
            }

            this.intervalId= setInterval(() => {
                this.refresh(this.el);
            }, this.intervalMillis);
        }
    }

    document.addEventListener('DOMContentLoaded', function(){
        const env= new Environment();
        const looper= new Looper();

        looper.start(function(dt){
            env.tick(dt);
        });

        new DebugMonitor({
            el: document.querySelector('#debug .meter .fps'),
            refresh: (el) => {
                el.value= looper.currentFPS;
            }
        }).enable();
        new DebugMonitor({
            el: document.querySelector('#debug .meter .world-ether'),
            refresh: (el) => {
                el.value= env.pools.ether.value;
            }
        }).enable();
        new DebugMonitor({
            el: document.querySelector('#debug .meter .world-mana'),
            refresh: (el) => {
                el.value= env.pools.mana.value;
            }
        }).enable();
    });
})();

if(true)
{
    class Circuit
    {
        constructor(opts)
        {
            opts || (opts= {});
        }
    }

    class Condenser
    {
    }

    class Amplifier
    {
        constructor(opts)
        {
            opts || (opts= {});

            this._in1= opts.in1;
            this._in2= opts.in2;
            this._out= opts.out;
        }

        apply()
        {
        }
    }

    class Ball
    {
        constructor()
        {
            this.el= document.createElement('span');
            this.el.style.width= '10px';
            this.el.style.height= '10px';
            this.el.style.backgroundColor= 'red';
            this.el.style.position= 'absolute';
            this.el.style.display= 'block';
            this.el.style.top= 300;

            document.body.appendChild(this.el);
        }

        get value()
        {
            return parseFloat(this.el.style.top);
        }

        set value(value)
        {
            this.el.style.top= (value + 300) + 'px';
        }
    }

    const NULL= {
        tick: () => {}
    };

    class Energy
    {
        constructor(opts)
        {
            opts || (opts= {});

            this._ether= opts.ether;
            this._mana= opts.mana;
        }

        get ether()
        {
            return this._ether;
        }

        set ether(value)
        {
            this._ether= value;
        }

        get mana()
        {
            return this._mana;
        }

        set mana(value)
        {
            this._mana= value;
        }

        toString()
        {
            return `{ ether : ${this.ether}, mana : ${this.mana} }`;
        }
    }

    class PowerSource
    {
        constructor(opts)
        {
            opts || (opts= {});

            this._ticks= 0;
            this.ball= new Ball();
        }

        tick(dt)
        {
            this._ticks+= dt;
            // 1tick = (1000 / 60) [ms]

            let energy= new Energy({
                ether: 100 * Math.sin(this._ticks * (1 / 60)),
                mana: 0
            });
            console.log('power source', energy.toString());
            this.ball.value= energy.ether;
            return energy;
        }
    }

    class Converter
    {
        constructor(opts)
        {
            opts || (opts= {});

            this._input= NULL;
        }

        get input()
        {
            return this._input;
        }

        set input(value)
        {
            this._input= value;
        }

        tick(dt)
        {
            let energy= this.input.tick(dt);
            let memo= Object.assign(new Energy(), energy);
            energy.mana+= energy.ether / 2;
            energy.ether= 0;
            console.log('converter', `${memo} => ${energy}`);
            return energy;
        }
    }

    class Effector
    {
        constructor(opts)
        {
            opts || (opts= {});

            this._input= NULL;
        }

        get input()
        {
            return this._input;
        }

        set input(value)
        {
            this._input= value;
        }

        tick(dt)
        {
            var energy= this.input.tick(dt);
            console.log('effector', `${energy}`);
            return `あなたに${energy.mana}のダメージ`;
        }
    }

    let p= new PowerSource();
    let conv= new Converter();
    let effect= new Effector();

    conv.input= p;
    effect.input= conv;

    setInterval(() => {
        console.log(effect.tick(1));
    }, 1000 / 60);

    if(false){
    // (in) -> (amp) -> (conv) -> (effect)
    // (sub in) -^

    let p1= new PowerSource();
    let p2= new PowerSource();
    let amp= new Amplifier();
    let conv= new Converter();
    let effect= new Effector();

    effect.in= conv.out;
    conv.in= amp.out;
    amp.in1= p1.out;
    amp.in2= p2.out;

    console.log(effect.apply());
    }
}
