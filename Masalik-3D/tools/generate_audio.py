"""Deterministic, original procedural audio. CC0. No downloads or sampled recordings."""
import math, random, wave, struct
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'assets/audio';out.mkdir(parents=True,exist_ok=True)
rate=22050
rng=random.Random(326)
def write(name,duration,sample):
 with wave.open(str(out/(name+'.wav')),'wb') as f:
  f.setparams((1,2,rate,0,'NONE','not compressed'))
  f.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,sample(i/rate)))*23000)) for i in range(int(duration*rate))))
def combustion(t,loaded=False):
 phase=(t*48)%1
 pulse=(math.exp(-phase*14)-0.075)*(0.7 if loaded else 0.4)
 bass=.15*math.sin(math.tau*24*t)+.10*math.sin(math.tau*48*t)
 harmonics=.06*math.sin(math.tau*96*t)+.04*math.sin(math.tau*144*t)
 rasp=rng.uniform(-1,1)*math.exp(-phase*9)*(.15 if loaded else .05)
 return math.tanh((pulse+bass+harmonics+rasp)*1.5)*.6
write('engine',2,lambda t:combustion(t))
write('engine_load',2,lambda t:combustion(t,True))
write('wind',3,lambda t:rng.uniform(-.11,.11)*(0.8+0.2*math.sin(math.tau*t/3)))
write('tires',2,lambda t:rng.uniform(-.12,.12)*(0.7+0.3*math.sin(math.tau*34*t)))
write('gravel',2,lambda t:rng.uniform(-.24,.24)+(rng.uniform(-.3,.3) if rng.random()>.99 else 0))
write('rain',3,lambda t:rng.uniform(-.22,.22)*(0.7+0.3*math.sin(math.tau*6*t)))
write('thunder',3.5,lambda t:(.2*math.sin(math.tau*(35-2*t)*t)+rng.uniform(-.5,.5))*min(t*10,1)*math.exp(-t*1.5))
write('shift',.24,lambda t:(.18*math.sin(math.tau*90*t)+rng.uniform(-.12,.12))*math.exp(-t*16))
write('suspension',.2,lambda t:.25*math.sin(math.tau*(180-50*t)*t)*math.exp(-t*24))
write('horn',.7,lambda t:.26*(math.sin(math.tau*440*t)+.5*math.sin(math.tau*554*t))*min(t*30,1,(.7-t)*30))
write('impact',.5,lambda t:rng.uniform(-1,1)*math.exp(-t*14))
write('click',.12,lambda t:.2*math.sin(math.tau*880*t)*math.exp(-t*35))
# Original plucked-string travel theme with percussion; not an authentic instrument recording.
notes=[293.66,320.24,349.23,392,349.23,320.24,293.66,261.63,293.66,349.23,440,392,349.23,320.24,261.63,293.66]
sequence=[]
for phrase in range(6):
 for n,freq in enumerate(notes if phrase%2==0 else list(reversed(notes))):
  samples=int(rate*.5);length=max(2,int(rate/freq));buffer=[rng.uniform(-.32,.32) for _ in range(length)];ptr=0
  for i in range(samples):
   value=buffer[ptr];buffer[ptr]=.496*(buffer[ptr]+buffer[(ptr+1)%length]);ptr=(ptr+1)%length
   t=i/rate;drum=.10*math.sin(math.tau*(80+50*math.exp(-t*35))*t)*math.exp(-t*26) if n%2==0 else .02*rng.uniform(-1,1)*math.exp(-t*35)
   sequence.append(value*.7+drum)
write('music',len(sequence)/rate,lambda t:sequence[min(len(sequence)-1,int(t*rate))])
