import { Level } from '../types';

export type TextEntry = {
    id: string;
    text: string;
    source?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Typing texts for each CEFR level — Turkish content optimized for key coverage
// ─────────────────────────────────────────────────────────────────────────────

const texts: Record<Level, TextEntry[]> = {

    A1: [
        {
            id: 'a1-1',
            text: 'ali okula gider. biz eve gelir. sen ne yaparsın. o kedi sever. bu ev büyük. masa beyaz. kedi uyur. gün güzel. biz mutluyuz. sen de gel.',
        },
        {
            id: 'a1-2',
            text: 'sabah kalktım. çay içtim. okula gittim. ders çalıştım. eve döndüm. uyudum. iyi geceler. hoş geldiniz. nasılsınız. teşekkür ederim.',
        },
        {
            id: 'a1-3',
            text: 'bir iki üç dört beş altı yedi sekiz dokuz on. kırmızı mavi sarı yeşil beyaz siyah. anne baba kardeş dost arkadaş komşu öğretmen.',
        },
        {
            id: 'a1-4',
            text: 'bugün hava güzel. güneş parlıyor. kuşlar ötüyor. çiçekler açıyor. parkta oyun oynadık. çok eğlendik. eve döndük. yemek yedik. yattık.',
        },
        {
            id: 'a1-5',
            text: 'merhaba ben ayşe. on iki yaşındayım. istanbul da yaşıyorum. okul çok güzel. öğretmenim çok iyi. derslerimi seviyorum. arkadaşlarım var.',
        },
    ],

    A2: [
        {
            id: 'a2-1',
            text: 'Her sabah saat yedide uyanırım. Kahvaltı yapar ve işe giderim. Ofiste çalışmak bazen zorlu olsa da arkadaşlarım sayesinde güzel vakit geçiririm.',
        },
        {
            id: 'a2-2',
            text: 'Türkiye çok güzel bir ülkedir. İstanbul, Ankara ve İzmir büyük şehirlerdir. Her şehrin kendine özgü kültürü ve yemekleri vardır.',
        },
        {
            id: 'a2-3',
            text: 'Kitap okumak hem eğlenceli hem de faydalıdır. Her gün en az yirmi dakika kitap okumalıyız. Bu sayede kelime hazinemizi geliştiririz.',
        },
        {
            id: 'a2-4',
            text: 'Hafta sonu ailemle pikniğe gittik. Mangal yaktık, oyunlar oynadık. Hava çok güzeldi. Çocuklar çok mutlu oldu. Akşam yorgun ama mutlu döndük.',
        },
        {
            id: 'a2-5',
            text: 'Alışveriş merkezine gittim. Birçok mağazayı gezdim. Kendime bir gömlek ve pantolon aldım. Sonra bir kafede oturdum ve kahve içtim.',
        },
    ],

    B1: [
        {
            id: 'b1-1',
            text: 'Teknoloji, günümüzde hayatımızın ayrılmaz bir parçası haline gelmiştir. Akıllı telefonlar, tabletler ve bilgisayarlar iletişimi kolaylaştırırken bizi daha verimli yapmaktadır. Ancak teknolojiye olan bağımlılık bazı sorunlara yol açabilmektedir.',
        },
        {
            id: 'b1-2',
            text: 'Sağlıklı yaşamın temeli düzenli egzersiz ve dengeli beslenmeden geçer. Haftada en az üç gün spor yapmak, kalp ve damar sağlığını korumak açısından oldukça önemlidir. Bunun yanı sıra bol su içmek ve yeterli uyku almak da vazgeçilmezdir.',
        },
        {
            id: 'b1-3',
            text: 'Türk mutfağı, yüzyıllar boyunca farklı kültürlerin etkisiyle zenginleşmiş ve dünya mutfaklarının en lezzetlilerinden biri haline gelmiştir. Kebap, baklava, börek ve çorba gibi yemekler uluslararası alanda da büyük beğeni toplamaktadır.',
        },
        {
            id: 'b1-4',
            text: 'Çevre kirliliği günümüzün en önemli sorunlarından birisi olup tüm insanlığı tehdit etmektedir. Fabrikaların zararlı gazlar salması, plastik atıkların doğaya karışması ve ormanların tahrip edilmesi ekosistemleri olumsuz etkilemektedir.',
        },
        {
            id: 'b1-5',
            text: 'Okumak, insanı geliştiren en temel etkinliklerden biridir. Roman, tarih, bilim ve felsefe kitapları okuyarak düşünce dünyamızı zenginleştiririz. Farklı bakış açıları kazanırız ve empati kurma yeteneğimiz gelişir.',
        },
    ],

    B2: [
        {
            id: 'b2-1',
            text: 'Yapay zeka teknolojisinin gelişimi, hem büyük fırsatlar hem de ciddi etik sorular beraberinde getirmektedir. Derin öğrenme algoritmaları, özellikle dil modelleri, insan düzeyinde performans sergilemeye başlamıştır. Bu durum iş dünyasından sağlığa kadar pek çok alanda köklü dönüşümlere neden olmaktadır.',
        },
        {
            id: 'b2-2',
            text: 'Osmanlı İmparatorluğu\'nun yüzyıllarca süren siyasi ve kültürel mirası, bugünkü Türkiye Cumhuriyeti\'nin şekillenmesinde belirleyici bir rol oynamıştır. Hukuk sisteminden mimari anlayışa, müzikten mutfak kültürüne uzanan geniş bir etki alanı mevcuttur.',
        },
        {
            id: 'b2-3',
            text: 'Küresel ısınma ve iklim değişikliği, insanlığın yüz yüze olduğu en karmaşık sorunların başında gelmektedir. Sera gazı salınımlarının sınırlandırılması ve yenilenebilir enerji kaynaklarına geçiş, sürdürülebilir bir gelecek için kaçınılmaz görünmektedir.',
        },
        {
            id: 'b2-4',
            text: 'Psikoloji araştırmaları, bireyin mutluluğunun büyük ölçüde anlam arayışı ve sağlıklı sosyal ilişkilerle bağlantılı olduğunu ortaya koymaktadır. Maddi refahın ötesinde, amaçlı bir yaşam sürmek ve topluma katkıda bulunmak bireyin öznel iyi oluşunu önemli ölçüde artırmaktadır.',
        },
        {
            id: 'b2-5',
            text: 'Modern şehirlerin tasarımı, insanların yaşam kalitesini doğrudan etkileyen karmaşık bir disiplinler arası süreçtir. Yeşil alanların planlanması, ulaşım altyapısının optimizasyonu ve sosyal donatıların dengeli dağılımı, kentsel yaşamın sürdürülebilirliği açısından kritik öneme sahiptir.',
        },
    ],

    C1: [
        {
            id: 'c1-1',
            text: 'Epistemoloji, bilginin doğasını, kaynağını ve sınırlarını sorgulayan felsefi bir disiplindir. Tümevarımsal akıl yürütmenin güvenilirliği, algının gerçekliği ne ölçüde yansıttığı ve doğrulanmış inanç ile bilgi arasındaki ayrım, bu alanın temel tartışma konuları arasında yer almaktadır.',
        },
        {
            id: 'c1-2',
            text: 'Nörobilim ve bilişsel psikoloji, beynin karar alma mekanizmalarını anlamlandırmaya çalışırken bilinç olgusunu da tartışmaya açmıştır. Prefrontal korteksin işlevselliği ile amigdalanın duygusal işlemlemesi arasındaki etkileşim, rasyonel muhakemeyi derinden etkilemektedir.',
        },
        {
            id: 'c1-3',
            text: 'Kuantum mekaniği, klasik fizik anlayışını temelinden sarsmış ve varlığa ilişkin önkabulleri yeniden sorgulatmıştır. Dalga-parçacık ikiliği, süperpozisyon ilkesi ve Heisenberg\'in belirsizlik ilkesi, gözlem eyleminin gerçeklik üzerindeki dönüştürücü etkisini ortaya koymaktadır.',
        },
        {
            id: 'c1-4',
            text: 'Sosyolojik perspektiften bakıldığında, küreselleşme süreci beraberinde kültürel homojenleşme baskısı getirirken yerel kimliklerin direnişini de tetiklemiştir. Diaspora toplulukları, aidiyet ve kimlik taleplerini üst-ulusal bağlamlarda yeni kavramsal çerçevelerle ifade etmektedir.',
        },
        {
            id: 'c1-5',
            text: 'Hukuk felsefesi çerçevesinde pozitivist ve doğal hukuk yaklaşımları arasındaki gerilim, meşruiyet kavramının yorumlanmasında belirleyici bir rol üstlenmektedir. Adalet ile hukuki kesinlik arasındaki denge, özellikle anayasal demokrasilerde yargı bağımsızlığı tartışmalarıyla iç içe geçmektedir.',
        },
    ],

    C2: [
        {
            id: 'c2-1',
            text: 'Postmodern edebiyat kuramı, metnin anlamının yazarın niyet düzeyinde tüketilmediğini, aksine okuyucunun yorumsal müdahalesiyle her defasında yeniden inşa edildiğini ileri sürmektedir. Roland Barthes\'ın "yazarın ölümü" tezi, özne merkezli anlamlandırma paradigmasını kökten sarsan bir epistemik kırılmayı simgelemektedir.',
        },
        {
            id: 'c2-2',
            text: 'Makroekonomik açıdan değerlendirildiğinde, para politikasının etkinliği doğrusal bir nedensellik zinciriyle sınırlı değildir; enflasyon beklentileri, reel faiz oranları ve döviz kuru dinamikleri karmaşık geribildirim döngüleri oluşturur. Merkez bankalarının iletişim stratejisi, piyasa algısını şekillendirmekte verimli piyasa hipotezinin öngördüğü mekanizmalar üzerinden belirleyici işlevler üstlenmektedir.',
        },
        {
            id: 'c2-3',
            text: 'Yapay zekanın etik boyutları tartışılırken "hizalama problemi" olarak adlandırılan mesele, otonom sistemlerin insanın değer yargılarıyla örtüşen kararlar almasının güvence altına alınması gerekliliğini ön plana çıkarmaktadır. Kontrol sorunu, yalnızca teknik bir mühendislik meselesi olmayıp normatif felsefe ile pratik etik arasında köprü kuran disiplinler arası bir zemine taşınmaktadır.',
        },
        {
            id: 'c2-4',
            text: 'Biyoetik alanında tartışılan gen düzenleme teknolojileri, kalıtsal hastalıkların giderilmesi potansiyelinin ötesinde, insan neslini kalıcı biçimde dönüştürme kapasitesiyle derin ahlaki sorular doğurmaktadır. CRISPR-Cas9 sisteminin klinik uygulamaları, onay prosedürleri ve uzun vadeli toplumsal etkileri bakımından henüz uzlaşı sağlanamamış hassas bir koordinasyon problemi olma niteliğini korumaktadır.',
        },
        {
            id: 'c2-5',
            text: 'Analitik felsefenin dil-anlam ilişkisine yönelik soruşturmaları, Wittgenstein\'ın geç dönem düşüncesinde somutlaşan "anlam kullanımdır" tezinin bir uzantısı olarak değerlendirilebilir.Sözdizimsel yapıların anlambilimsel içeriklerle eşleştirilme biçimi, doğal dil işleme sistemleri için de temel bir modelleme güçlüğü teşkil etmekte; bu durum hesaplamalı dilbilim ile felsefi semantiğin kesişim noktasını giderek daha stratejik bir zemine taşımaktadır.',
        },
    ],
};

export function getTextsForLevel(level: Level): TextEntry[] {
    return texts[level];
}

export function getRandomText(level: Level): TextEntry {
    const pool = texts[level];
    return pool[Math.floor(Math.random() * pool.length)];
}

export default texts;
