"""Original deterministic synthesis, no downloads; assets licensed CC0 by project author."""
import math, random, wave, struct
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'assets/audio';out.mkdir(parents=True,exist_ok=True)
rate=22050
random.seed(326)
def write(name,duration,sample):
 with wave.open(str(out/(name+'.wav')),'wb') as f:
  f.setparams((1,2,rate,0,'NONE','not compressed'))
  f.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,sample(i/rate)))*20000)) for i in range(int(duration*rate))))
write('engine',1,lambda t: .24*math.sin(math.tau*48*t)+.12*math.sin(math.tau*96*t)+.08*math.sin(math.tau*144*t))
write('wind',2,lambda t: random.uniform(-.12,.12))
write('tires',1,lambda t: random.uniform(-.3,.3)*(0.6+0.4*math.sin(math.tau*60*t)))
write('horn',.7,lambda t: .3*(math.sin(math.tau*440*t)+.5*math.sin(math.tau*554*t))*min(t*30,1,(.7-t)*30))
write('impact',.5,lambda t: random.uniform(-1,1)*math.exp(-t*14))
write('click',.12,lambda t: .2*math.sin(math.tau*880*t)*math.exp(-t*35))
notes=[220,261.63,293.66,329.63,293.66,261.63,196,220,220,293.66,349.23,329.63,293.66,261.63,246.94,220]
def music(t):
 i=int(t*2)%len(notes);phase=t%0.5
 melody=.12*math.sin(math.tau*notes[i]*t)*math.sin(math.pi*phase/.5)**2
 bass=.09*math.sin(math.tau*(110 if int(t/2)%2==0 else 98)*t)
 drum=.15*math.sin(math.tau*(70+40*math.exp(-phase*30))*phase)*math.exp(-phase*25)
 return melody+bass+drum
write('music',8,music)
