(function installHeroAuditOutreachTemplate(){
  if(typeof window==='undefined'||typeof document==='undefined')return;

  function build(name){
    const spot=name||'施設';
    const subject=`【画像素材についてのご相談】${spot}｜Kibun Trip`;
    const email=`${spot} ご担当者様\n\nはじめまして。関東近郊のおでかけ先を、気分や過ごし方から探せるWebサービス「Kibun Trip」（https://kibuntrip.com/）を運営しております。\n\n現在、${spot}様をKibun Trip内でご紹介するにあたり、施設の雰囲気をより正確にお伝えしたく、ご連絡いたしました。\n\nもし広報用素材や、Web掲載に使用可能な公式画像がございましたら、ご案内いただくことは可能でしょうか。新たに画像をお送りいただかなくても、プレス向け素材ページやダウンロードURL等がございましたら、そちらをご共有いただけるだけでも大変助かります。\n\n【掲載予定】\n・Kibun Trip内のスポット紹介ページ、一覧カード\n・関連記事、モデルプラン\n・Kibun Trip公式SNSでの紹介（必要に応じて）\n\n【希望する画像】\n外観・内観・体験風景など、施設の魅力や雰囲気が伝わる横長のお写真を中心に1〜3点程度\n\nクレジット表記、利用範囲、掲載期限、SNS利用可否、トリミング可否などの指定がございましたら、すべてその条件に従います。画像加工は原則として表示サイズに合わせたトリミング・リサイズ程度です。\n\nなお、Kibun Tripは編集型のおでかけ情報サービスで、記事やスポット紹介の一部にアフィリエイトリンクを含む場合があります。\n\n使用可能な画像や広報素材がございましたら、画像データまたは素材ページ／ダウンロードURL、必要なクレジット表記・利用条件をご案内いただけますと幸いです。素材提供が難しい場合は、その旨だけでもご返信いただけますと助かります。\n\nお忙しいところ恐れ入りますが、どうぞよろしくお願いいたします。\n\nKibun Trip 運営事務局\nWeb：https://kibuntrip.com/\nInstagram：@kibuntrip\nEmail：hello@kibuntrip.com`;
    const form=`お世話になります。関東近郊のおでかけ先を気分から探せるWebサービス「Kibun Trip」（https://kibuntrip.com/）を運営しております。${spot}様を当サイトでご紹介するにあたり、もし広報用素材やWeb掲載に使用可能な公式画像がございましたら、ご案内いただけますでしょうか。新たに画像をお送りいただく必要はなく、既存のプレス素材ページやダウンロードURLでも大変助かります。掲載先はスポット紹介ページ・一覧カード・関連記事・モデルプラン等で、必要に応じて公式SNSでも紹介します。クレジット、利用範囲、掲載期限、SNS利用可否、トリミング可否等の条件には従います。サイト内には一部アフィリエイトリンクを含む場合があります。使用可能な素材URLと利用条件をご案内いただけますと幸いです。Kibun Trip運営事務局 / hello@kibuntrip.com`;
    return {subject,email,form};
  }

  function apply(name){
    const panel=document.querySelector('.hero-request-panel.is-open,.hero-request-panel');
    if(!panel)return;
    const copy=build(name);
    const subject=panel.querySelector('[data-request-subject]');
    const email=panel.querySelector('[data-request-email-body]');
    const form=panel.querySelector('[data-request-form-body]');
    if(subject)subject.value=copy.subject;
    if(email)email.value=copy.email;
    if(form)form.value=copy.form;
    [subject,email,form].forEach(el=>{if(el)el.dispatchEvent(new Event('input',{bubbles:true}));});
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.hero-source-request');
    if(!button)return;
    const card=button.closest('.hero-source-card');
    const name=card?.querySelector('h3')?.textContent?.trim()||'施設';
    setTimeout(()=>apply(name),0);
  },true);
})(typeof window!=='undefined'?window:globalThis);
