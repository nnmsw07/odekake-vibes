from PIL import Image,ImageDraw,ImageFont,ImageFilter
from pathlib import Path
import textwrap
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/og-v201125'
OUT.mkdir(parents=True,exist_ok=True)
serif='/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
sans='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
items={
 'comfortable-day':('COMFORTABLE DAY · ALL SEASONS','心地よく過ごしたい日に。\n季節に合わせる7つの場所','assets/mood-v201900/comfortable.webp'),
 'stage-day':('STAGE DAY · TOKYO / YOKOHAMA','幕が上がる日を、休日の主役に。\nバレエ・演劇・歌舞伎・音楽の7劇場','assets/editorial/culture.webp'),
 'whats-on-weekend':("WHAT’S ON · LIMITED TIME",'「今日だけ」を拾いに行く。\n展覧会・季節イベント・体験から休日を決める','assets/mood-v201900/extraordinary.webp'),
 'books-and-architecture':('BOOKS · ARCHITECTURE · QUIET','本と建築で、静かな午後。\nひとりでもふたりでも行きたい7スポット','assets/editorial/scenic.webp'),
 'indoor-adult-day':('INDOOR · ADULT DAY','雨でも暑くても、\n大人の休日はちゃんと作れる。','assets/mood-v201900/relax.webp'),
 'yokohama-after-curtain':('AFTER THE CURTAIN · YOKOHAMA','観劇の前後、横浜でどこへ行く？\n港の余韻まで楽しむ6スポット','assets/mood-v201900/comfortable.webp'),
}
W,H=1200,630
for slug,(label,title,src_rel) in items.items():
    bg=Image.new('RGB',(W,H),(247,242,233))
    src=Image.open(ROOT/src_rel).convert('RGB')
    target_w=500
    scale=max(target_w/src.width,H/src.height)
    im=src.resize((round(src.width*scale),round(src.height*scale)),Image.Resampling.LANCZOS)
    left=max(0,(im.width-target_w)//2); top=max(0,(im.height-H)//2)
    im=im.crop((left,top,left+target_w,top+H))
    bg.paste(im,(700,0))
    d=ImageDraw.Draw(bg)
    # Kibun dots
    for x,c in zip((82,106,130),('#6f8c78','#dd7358','#e3ae45')):
        d.ellipse((x,55,x+24,79),fill=c)
    fbrand=ImageFont.truetype(sans,34,index=2)
    flabel=ImageFont.truetype(sans,19,index=2)
    ftitle=ImageFont.truetype(serif,47,index=2)
    fsmall=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',20,index=2)
    d.text((166,48),'Kibun Trip',font=fbrand,fill='#26241f')
    d.text((58,160),label,font=flabel,fill='#506651')
    y=220
    for line in title.split('\n'):
        # soft wrap for especially long line
        chunks=[]
        if len(line)>20:
            cur=''
            for ch in line:
                test=cur+ch
                if d.textlength(test,font=ftitle)>570 and cur:
                    chunks.append(cur);cur=ch
                else:cur=test
            if cur: chunks.append(cur)
        else:chunks=[line]
        for chunk in chunks:
            d.text((58,y),chunk,font=ftitle,fill='#2d2924')
            y+=68
    d.line((58,520,628,520),fill='#c9c0b4',width=1)
    d.text((58,553),'場所ではなく、過ごし方から。',font=fsmall,fill='#767067')
    d.text((58,589),'kibuntrip.com',font=fsmall,fill='#506651')
    bg.save(OUT/f'{slug}-v201125.jpg',quality=90,optimize=True)
print('generated',len(items),'OGP images')
