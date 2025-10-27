import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

const app = new Hono()

// ============================================
// 📊 STATISTIKEN UND DATENMODELLE
// ============================================

interface FormData {
  unternehmensgroesse: string
  branche: string
  jahresumsatz: string
  mitarbeiteranzahl: number
  familienunternehmen: string
  nachfolgerVorhanden: string
  nachfolgerTyp?: string
  zeitrahmen: string
  alterInhaber: number
  emotionaleBindung: string
  finanzielleErwartungen: string
}

interface Analyse {
  prioritaet: string
  perspektiven: {
    emotional: string[]
    rechtlich: string[]
    steuerlich: string[]
    organisatorisch: string[]
  }
  naechste_schritte: string[]
  risiken: string[]
  chancen: string[]
  zeitplan: string
  erfolgsfaktoren: string[]
}

interface ChatMessage {
  role: 'bot' | 'user'
  content: string
  options?: string[]
}

// ============================================
// 🤖 CHATBOT LOGIK
// ============================================

const chatbotQuestions = [
  {
    id: 'greeting',
    question: 'Willkommen! Ich helfe Ihnen bei der Planung Ihrer Unternehmensnachfolge. Ich werde Ihnen einige Fragen stellen, um Ihre Situation besser zu verstehen. Sind Sie bereit zu beginnen?',
    field: null,
    options: ['Ja, los geht\'s!']
  },
  {
    id: 'unternehmensgroesse',
    question: 'Wie würden Sie die Größe Ihres Unternehmens beschreiben?',
    field: 'unternehmensgroesse',
    options: ['Klein (bis 10 Mitarbeiter)', 'Mittel (10-50 Mitarbeiter)', 'Groß (über 50 Mitarbeiter)']
  },
  {
    id: 'branche',
    question: 'In welcher Branche ist Ihr Unternehmen tätig?',
    field: 'branche',
    options: ['Handwerk', 'Produktion', 'Handel', 'Dienstleistung', 'IT/Tech', 'Andere']
  },
  {
    id: 'jahresumsatz',
    question: 'Wie hoch ist Ihr ungefährer Jahresumsatz?',
    field: 'jahresumsatz',
    options: ['Unter 500.000 €', '500.000 - 2 Mio. €', '2 - 10 Mio. €', 'Über 10 Mio. €']
  },
  {
    id: 'mitarbeiteranzahl',
    question: 'Wie viele Mitarbeiter beschäftigt Ihr Unternehmen? (Bitte geben Sie eine Zahl ein)',
    field: 'mitarbeiteranzahl',
    options: null
  },
  {
    id: 'familienunternehmen',
    question: 'Ist Ihr Unternehmen ein Familienunternehmen?',
    field: 'familienunternehmen',
    options: ['Ja', 'Nein']
  },
  {
    id: 'nachfolgerVorhanden',
    question: 'Haben Sie bereits einen potenziellen Nachfolger identifiziert?',
    field: 'nachfolgerVorhanden',
    options: ['Ja', 'Nein', 'Unklar']
  },
  {
    id: 'nachfolgerTyp',
    question: 'Welche Art von Nachfolger kommt für Sie in Frage?',
    field: 'nachfolgerTyp',
    options: ['Familienintern', 'Mitarbeiter/Management', 'Externe Person/Unternehmen']
  },
  {
    id: 'zeitrahmen',
    question: 'In welchem Zeitrahmen planen Sie die Übergabe?',
    field: 'zeitrahmen',
    options: ['Unter 2 Jahren', '2-5 Jahre', 'Über 5 Jahre']
  },
  {
    id: 'alterInhaber',
    question: 'Wie alt sind Sie? (Bitte geben Sie Ihr Alter in Jahren ein)',
    field: 'alterInhaber',
    options: null
  },
  {
    id: 'emotionaleBindung',
    question: 'Wie würden Sie Ihre emotionale Bindung an das Unternehmen beschreiben?',
    field: 'emotionaleBindung',
    options: ['Sehr hoch', 'Hoch', 'Mittel', 'Niedrig']
  },
  {
    id: 'finanzielleErwartungen',
    question: 'Wie hoch sind Ihre finanziellen Erwartungen an die Übergabe?',
    field: 'finanzielleErwartungen',
    options: ['Sehr hoch', 'Hoch', 'Mittel', 'Niedrig']
  }
]

function mapChatAnswerToValue(questionId: string, answer: string): string {
  const mappings: { [key: string]: { [key: string]: string } } = {
    'unternehmensgroesse': {
      'Klein (bis 10 Mitarbeiter)': 'klein',
      'Mittel (10-50 Mitarbeiter)': 'mittel',
      'Groß (über 50 Mitarbeiter)': 'gross'
    },
    'branche': {
      'Handwerk': 'handwerk',
      'Produktion': 'produktion',
      'Handel': 'handel',
      'Dienstleistung': 'dienstleistung',
      'IT/Tech': 'it',
      'Andere': 'andere'
    },
    'jahresumsatz': {
      'Unter 500.000 €': 'unter_500k',
      '500.000 - 2 Mio. €': '500k_2m',
      '2 - 10 Mio. €': '2m_10m',
      'Über 10 Mio. €': 'ueber_10m'
    },
    'familienunternehmen': {
      'Ja': 'ja',
      'Nein': 'nein'
    },
    'nachfolgerVorhanden': {
      'Ja': 'ja',
      'Nein': 'nein',
      'Unklar': 'unklar'
    },
    'nachfolgerTyp': {
      'Familienintern': 'familie',
      'Mitarbeiter/Management': 'mitarbeiter',
      'Externe Person/Unternehmen': 'extern'
    },
    'zeitrahmen': {
      'Unter 2 Jahren': 'unter_2_jahre',
      '2-5 Jahre': '2_5_jahre',
      'Über 5 Jahre': 'ueber_5_jahre'
    },
    'emotionaleBindung': {
      'Sehr hoch': 'sehr_hoch',
      'Hoch': 'hoch',
      'Mittel': 'mittel',
      'Niedrig': 'niedrig'
    },
    'finanzielleErwartungen': {
      'Sehr hoch': 'sehr_hoch',
      'Hoch': 'hoch',
      'Mittel': 'mittel',
      'Niedrig': 'niedrig'
    }
  }

  return mappings[questionId]?.[answer] || answer
}

// ============================================
// 🧠 ANALYSE-ENGINE
// ============================================

function analyseUnternehmensnachfolge(data: FormData): Analyse {
  const analyse: Analyse = {
    prioritaet: '',
    perspektiven: {
      emotional: [],
      rechtlich: [],
      steuerlich: [],
      organisatorisch: []
    },
    naechste_schritte: [],
    risiken: [],
    chancen: [],
    zeitplan: '',
    erfolgsfaktoren: []
  }

  // Priorität basierend auf Zeitrahmen
  if (data.zeitrahmen === 'unter_2_jahre') {
    analyse.prioritaet = 'HOCH - Dringender Handlungsbedarf! Sie haben weniger als 2 Jahre Zeit.'
  } else if (data.zeitrahmen === '2_5_jahre') {
    analyse.prioritaet = 'MITTEL - Strukturierte Planung erforderlich. Sie haben ein gutes Zeitfenster.'
  } else {
    analyse.prioritaet = 'NIEDRIG - Gute Ausgangslage. Sie haben ausreichend Zeit für eine strategische Planung.'
  }

  // Szenario-basierte Analyse
  const nachfolgerTyp = data.nachfolgerVorhanden === 'ja' ? data.nachfolgerTyp : 'unklar'

  // ============================================
  // 🏠 FALL 1: FAMILIENINTERNE NACHFOLGE
  // ============================================
  if (nachfolgerTyp === 'familie') {
    // Emotional
    analyse.perspektiven.emotional.push(
      '👨‍👩‍👧 **Familieninterne Übergabe** - Sie planen eine Übergabe innerhalb der Familie.',
      '💭 **Loslassen lernen**: "Die Grenzen zwischen Unternehmen und Privatbereich verschieben sich" - bereiten Sie sich mental auf diese Veränderung vor.',
      '🎯 **Motivation prüfen**: "Es geht uns ums Wollen. Wer nicht überzeugt ist, den sollte man nicht in die Chefsessel der Eltern setzen."',
      '⚖️ **Geschwisterausgleich**: Denken Sie an faire Lösungen für nicht-nachfolgende Geschwister (Pflichtteilsansprüche, Ausgleichszahlungen).'
    )

    if (data.emotionaleBindung === 'sehr_hoch' || data.emotionaleBindung === 'hoch') {
      analyse.perspektiven.emotional.push(
        '❤️ **Hohe emotionale Bindung**: Ihre starke Verbindung zum Unternehmen ist verständlich. Planen Sie eine schrittweise Ablösung ein.',
        '🔄 **Neue Lebensphase**: Entwickeln Sie Visionen für Ihre Zeit nach der Übergabe. Was möchten Sie noch erreichen?'
      )
    }

    // Rechtlich
    analyse.perspektiven.rechtlich.push(
      '📜 **Gesellschaftsvertrag prüfen**: Enthält er Nachfolgeregelungen und Ausgleichsmechanismen?',
      '⚖️ **Testament aufsetzen**: "Gesellschaftsvertrag und Testament sollten immer aufeinander abgestimmt sein"',
      '🆘 **Notfallplan erstellen**: "Notfallplan ist kein Nice-to-have, sondern existenziell" - Was passiert bei plötzlicher Arbeitsunfähigkeit?',
      '👨‍⚖️ **Pflichtteilsansprüche beachten**: Geschwister haben gesetzliche Ansprüche, auch wenn sie nicht ins Unternehmen eintreten.'
    )

    // Steuerlich
    analyse.perspektiven.steuerlich.push(
      '💰 **Freibeträge nutzen**: 400.000 € Freibetrag pro Kind alle 10 Jahre - "Frühzeitige Planung kann Hunderttausende Euro sparen"',
      '🎁 **Schenkung vs. Vererbung**: Schrittweise Übertragung zu Lebzeiten reduziert die Steuerlast erheblich.',
      '🏭 **Verschonungsregelungen**: Betriebsvermögen kann bis zu 100% steuerfrei übertragen werden (bei Lohnsummen- und Behaltensregeln).',
      '📊 **Bewertung optimieren**: Nutzen Sie vereinfachtes Ertragswertverfahren für günstigere Bemessungsgrundlage.'
    )

    // Organisatorisch
    analyse.perspektiven.organisatorisch.push(
      '👔 **Schrittweise Einarbeitung**: Planen Sie 2-3 Jahre Übergangszeit mit klarer Rollenverteilung.',
      '📚 **Wissenstransfer**: Dokumentieren Sie Ihr Expertenwissen, Kundenkontakte und Prozesse systematisch.',
      '🎓 **Qualifizierung**: Falls nötig, unterstützen Sie die Weiterbildung des Nachfolgers (z.B. Betriebswirt, Branchenzertifikate).',
      '🔍 **Unternehmen fit machen**: Bereinigen Sie die Bilanz, modernisieren Sie Prozesse, klären Sie rechtliche Altlasten.'
    )

    // Risiken
    analyse.risiken.push(
      '⚠️ 36% der Familiennachfolgen scheitern an unzureichend vorbereiteten Nachfolgern',
      '⚠️ Konflikte mit nicht-nachfolgenden Geschwistern',
      '⚠️ Emotionale Verstrickungen können sachliche Entscheidungen erschweren',
      '⚠️ Gefahr der "zu langsamen" Übergabe - klare Deadlines setzen'
    )

    // Chancen
    analyse.chancen.push(
      '✅ Vertrauen und Loyalität sind bereits vorhanden',
      '✅ Langfristige Kontinuität für Kunden und Mitarbeiter',
      '✅ Steueroptimierung durch Freibeträge und Verschonungsregeln',
      '✅ Legacy - Ihr Lebenswerk bleibt in der Familie'
    )
  }

  // ============================================
  // 🤝 FALL 2: MANAGEMENT-BUY-OUT (MBO)
  // ============================================
  else if (nachfolgerTyp === 'mitarbeiter') {
    // Emotional
    analyse.perspektiven.emotional.push(
      '🤝 **Management-Buy-Out** - Sie planen die Übergabe an Ihre Mitarbeiter.',
      '💼 **Vertrauen als Basis**: "Aus den eigenen Reihen: Vertrauen als Basis" - Ihre Mitarbeiter kennen das Unternehmen.',
      '🎯 **Loyalität nutzen**: Die emotionale Bindung Ihrer Mitarbeiter ist ein großer Vorteil.',
      '⚡ **Loslassen**: Bereiten Sie sich darauf vor, dass neue Führung andere Wege gehen wird.'
    )

    // Rechtlich
    analyse.perspektiven.rechtlich.push(
      '📝 **Kaufvertrag präzise gestalten**: Asset Deal oder Share Deal? Haftungsausschlüsse klar regeln.',
      '⚖️ **Garantien und Gewährleistungen**: Was garantieren Sie für Bilanzen, Verträge, Verbindlichkeiten?',
      '🔒 **Verkäuferdarlehen absichern**: Falls Sie finanzieren, benötigen Sie Sicherheiten (z.B. Grundschuld, Bürgschaften).',
      '🆘 **Notfallplan**: Auch bei MBO wichtig - was passiert, wenn Käufer zahlungsunfähig wird?'
    )

    // Steuerlich
    analyse.perspektiven.steuerlich.push(
      '💰 **Veräußerungsgewinn versteuern**: Tarifbegünstigung nach § 34 EStG kann Steuerlast halbieren.',
      '🏢 **Asset Deal vs. Share Deal**: Asset Deal = höhere Steuer, aber bessere Abschreibungen für Käufer.',
      '📊 **Earn-Out-Klausel**: Gestaffelte Zahlung reduziert Steuerlast und Risiko.',
      '💡 **Freibetrag nutzen**: Bei Schenkung von Anteilen (z.B. an langjährige Mitarbeiter) können Freibeträge greifen.'
    )

    // Organisatorisch
    analyse.perspektiven.organisatorisch.push(
      '💵 **Finanzierung klären**: 48% der Nachfolger haben Finanzierungsprobleme - Banken, Verkäuferdarlehen, Private Equity?',
      '📈 **Realistische Bewertung**: 34% scheitern an überzogenen Preisvorstellungen - nutzen Sie Gutachter.',
      '⏳ **Übergangszeit**: Bleiben Sie 1-2 Jahre beratend zur Verfügung (gegen Honorar).',
      '🎯 **Earn-Out-Modell**: Kaufpreis teilweise erfolgsabhängig gestalten - motiviert beide Seiten.'
    )

    // Risiken
    analyse.risiken.push(
      '⚠️ 48% der Nachfolger haben Finanzierungsschwierigkeiten',
      '⚠️ 34% scheitern an überzogenen Kaufpreisvorstellungen',
      '⚠️ Geschäftsführer-Fähigkeiten vs. Fach-Expertise - nicht jeder gute Techniker ist ein guter Chef',
      '⚠️ Finanzierungsrisiko - wenn die Bank abspringt oder Käufer zahlungsunfähig wird'
    )

    // Chancen
    analyse.chancen.push(
      '✅ Mitarbeiter kennen Unternehmen, Kunden und Prozesse',
      '✅ Hohe Kontinuität und Stabilität',
      '✅ Verkäuferdarlehen kann attraktive Verzinsung bieten',
      '✅ Ihr Lebenswerk wird weitergeführt von Menschen, die Sie schätzen'
    )
  }

  // ============================================
  // 🌟 FALL 3: EXTERNE GESCHÄFTSFÜHRUNG
  // ============================================
  else if (nachfolgerTyp === 'extern' && data.finanzielleErwartungen === 'niedrig') {
    // Emotional
    analyse.perspektiven.emotional.push(
      '🌟 **Externe Geschäftsführung** - Sie trennen Eigentum und Führung.',
      '🎯 **Frischer Wind**: "Frischer Wind von außen bringt neue Perspektiven"',
      '💼 **Eigentümerrolle**: Sie bleiben Eigentümer, delegieren aber die operative Führung.',
      '🔄 **Kulturwandel**: Bereiten Sie sich und Ihre Mitarbeiter auf Veränderungen vor.'
    )

    // Rechtlich
    analyse.perspektiven.rechtlich.push(
      '📝 **Geschäftsführervertrag**: Klare Kompetenzen, Vergütung, Zielvereinbarungen, Kündigungsfristen.',
      '⚖️ **Governance-Struktur**: Beirat oder Aufsichtsrat zur Kontrolle einrichten.',
      '🔒 **Wettbewerbsverbot**: Schützen Sie Ihr Know-how durch Verschwiegenheits- und Wettbewerbsklauseln.',
      '🆘 **Notfallplan**: Was passiert, wenn der neue GF ausfällt oder scheitert?'
    )

    // Steuerlich
    analyse.perspektiven.steuerlich.push(
      '💰 **Gehalt des GF steuerlich absetzbar**: Die Geschäftsführer-Vergütung reduziert Ihren Gewinn.',
      '🏢 **Gewinnausschüttungen**: Als Eigentümer erhalten Sie weiterhin Dividenden (Abgeltungssteuer 25%).',
      '📊 **Pensionszusage möglich**: Externe GF können Pensionszusagen erhalten - steuerlich optimiert.',
      '💡 **Verlagerung der Steuerlast**: Geschäftsführer-Gehalt wird beim GF versteuert, nicht bei Ihnen.'
    )

    // Organisatorisch
    analyse.perspektiven.organisatorisch.push(
      '🔍 **Headhunter einschalten**: Professionelle Suche erhöht Erfolgsquote erheblich.',
      '📚 **Einarbeitungsphase 6-12 Monate**: Begleiten Sie den neuen GF intensiv.',
      '🎯 **Zielvereinbarungen**: SMART-Ziele mit klaren KPIs (Umsatz, Marge, Kundenzufriedenheit).',
      '🔄 **Regelmäßige Evaluierung**: Quartalsweise Reviews und jährliche Zielgespräche.'
    )

    // Risiken
    analyse.risiken.push(
      '⚠️ Kulturelle Passung - externe Manager müssen zur Unternehmenskultur passen',
      '⚠️ Loyalität - externer GF hat nicht dieselbe emotionale Bindung',
      '⚠️ Wissensabfluss - Schutz von Betriebsgeheimnissen wichtig',
      '⚠️ Kosten - Headhunter und attraktive Vergütung sind teuer'
    )

    // Chancen
    analyse.chancen.push(
      '✅ Neue Ideen und frische Perspektiven',
      '✅ Sie bleiben Eigentümer und profitieren vom Gewinn',
      '✅ Professionalisierung der Führung',
      '✅ Sie gewinnen Freiheit bei Erhalt des Vermögens'
    )
  }

  // ============================================
  // 💼 FALL 4: VERKAUF / M&A
  // ============================================
  else {
    // Emotional
    analyse.perspektiven.emotional.push(
      '💼 **Unternehmensverkauf / M&A** - Sie planen einen externen Verkauf.',
      '🎯 **Neuanfang**: "Ein guter Deal erfordert realistische Bewertung und gründliche Due Diligence"',
      '💭 **Abschied nehmen**: Der Verkauf bedeutet einen klaren Schnitt - bereiten Sie sich emotional vor.',
      '🔄 **Neue Perspektiven**: Was möchten Sie nach dem Verkauf erreichen? Ehrenamt, Reisen, neues Business?'
    )

    if (data.emotionaleBindung === 'sehr_hoch' || data.emotionaleBindung === 'hoch') {
      analyse.perspektiven.emotional.push(
        '❤️ **Hohe Bindung beachten**: Der Abschied wird emotional - planen Sie Übergangszeit und Rituale ein.',
        '🔄 **Legacy sichern**: Verhandeln Sie Klauseln zum Erhalt von Markennamen, Standort, Arbeitsplätzen.'
      )
    }

    // Rechtlich
    analyse.perspektiven.rechtlich.push(
      '📝 **Due Diligence vorbereiten**: Käufer prüft Verträge, Verbindlichkeiten, Rechtsstreitigkeiten, IP-Rechte.',
      '🏢 **Asset Deal vs. Share Deal**: Share Deal = Käufer übernimmt alle Risiken. Asset Deal = Sie behalten Altlasten.',
      '⚖️ **Kaufvertrag und Garantien**: Welche Garantien geben Sie? Für welchen Zeitraum haften Sie?',
      '🔒 **Kartellrecht prüfen**: Bei größeren Deals kann Bundeskartellamt zustimmen müssen.',
      '👥 **Arbeitnehmerrechte**: Betriebsübergang nach § 613a BGB - Mitarbeiter müssen informiert werden.'
    )

    // Steuerlich
    analyse.perspektiven.steuerlich.push(
      '💰 **Veräußerungsgewinn**: Tarifbegünstigung § 34 EStG (ca. 28% statt 42% Steuersatz) bei Betriebsaufgabe.',
      '🏢 **Share Deal Vorteile**: Sperrfrist beachten, aber oft steuerlich günstiger für Verkäufer.',
      '📊 **Asset Deal Nachteile**: Hohe Steuerlast für Sie, aber Käufer kann Anlagevermögen neu abschreiben.',
      '💡 **Steuerberater einschalten**: Die Steueroptimierung kann mehrere 100.000 € Unterschied machen.',
      '🎯 **Freibetrag bei Betriebsveräußerung**: Bis 45.000 € steuerfrei (gestaffelt bis Alter 55+).'
    )

    // Organisatorisch
    analyse.perspektiven.organisatorisch.push(
      '🔍 **M&A-Berater beauftragen**: Professionelle Begleitung erhöht Verkaufspreis um durchschnittlich 15-20%.',
      '📈 **Unternehmensbewertung**: Ertragswert, Multiplikator-Verfahren, DCF - holen Sie mehrere Gutachten ein.',
      '💵 **Käuferkreis definieren**: Strategischer Käufer (zahlt mehr) oder Finanzinvestor (schnellerer Deal)?',
      '⏳ **Verkaufsprozess 6-18 Monate**: Vorbereitung, Käufersuche, Due Diligence, Vertragsverhandlung.',
      '🎯 **Earn-Out-Klausel**: Teil des Kaufpreises erfolgsabhängig - kann Bewertungslücke schließen.'
    )

    // Risiken
    analyse.risiken.push(
      '⚠️ 34% scheitern an überzogenen Kaufpreisvorstellungen - seien Sie realistisch',
      '⚠️ Due Diligence deckt oft Probleme auf - bereiten Sie sich vor',
      '⚠️ Käufer kann Mitarbeiter kündigen oder Standort schließen',
      '⚠️ Vertraulichkeit - Deal kann platzen oder Wettbewerber erfährt Details'
    )

    // Chancen
    analyse.chancen.push(
      '✅ 48% planen 2024 externen Verkauf - der Markt ist aktiv',
      '✅ Klarer Schnitt - Sie sind finanziell abgesichert',
      '✅ Strategische Käufer zahlen oft Premium (Synergieeffekte)',
      '✅ Ihr Lebenswerk kann in größerem Kontext weiterwachsen'
    )
  }

  // ============================================
  // 🎯 GEMEINSAME ERFOLGSFAKTOREN
  // ============================================
  analyse.erfolgsfaktoren.push(
    '✅ **Frühzeitige Planung**: Statistisch erfolgreicher bei Vorlaufzeit 5+ Jahre',
    '✅ **Professionelle Beratung**: Fachanwalt, Steuerberater, Nachfolgeberater einbinden',
    '✅ **Transparente Kommunikation**: Mit Familie, Mitarbeitern, Kunden',
    '✅ **Unternehmen fit machen**: Prozesse, Dokumentation, Bilanz bereinigen',
    '✅ **Emotionen managen**: Coaching oder Supervision kann helfen',
    '✅ **Realistische Erwartungen**: Bei Bewertung, Zeitrahmen und Nachfolger-Qualifikation'
  )

  // ============================================
  // 📅 ZEITPLAN
  // ============================================
  if (data.zeitrahmen === 'unter_2_jahre') {
    analyse.zeitplan = `
**Phase 1 (0-6 Monate): SOFORT**
- Notfallplan erstellen
- Rechtliche Basics klären (Testament, Vollmachten)
- Grobe Unternehmensbewertung
- Erste Gespräche mit Nachfolger / Käufersuche starten

**Phase 2 (6-18 Monate): INTENSIV**
- Detaillierte Due Diligence Vorbereitung
- Vertragsverhandlungen
- Steueroptimierung umsetzen
- Wissenstransfer starten

**Phase 3 (18-24 Monate): ÜBERGABE**
- Vertragsabschluss
- Übergabe vollziehen
- Begleitphase mit klarem Ausstiegsdatum
    `
  } else if (data.zeitrahmen === '2_5_jahre') {
    analyse.zeitplan = `
**Phase 1 (Jahr 1-2): VORBEREITUNG**
- Notfallplan und Testament
- Unternehmen analysieren und optimieren
- Nachfolger identifizieren / Käufersuche
- Erste steuerliche Weichenstellungen

**Phase 2 (Jahr 2-4): QUALIFIZIERUNG**
- Nachfolger einarbeiten / Due Diligence
- Schrittweise Verantwortungsübertragung
- Vertragswerke vorbereiten
- Steuerstrategie finalisieren

**Phase 3 (Jahr 4-5): ÜBERGABE**
- Formale Übergabe
- Begleitphase 6-12 Monate
- Rollenwechsel vollziehen
    `
  } else {
    analyse.zeitplan = `
**Phase 1 (Jahr 1-3): STRATEGISCHE PLANUNG**
- Nachfolgestrategie definieren
- Unternehmen zukunftsfähig machen
- Notfallplan und Testament
- Erste steuerliche Optimierungen (Freibeträge alle 10 Jahre)

**Phase 2 (Jahr 3-5): NACHFOLGER ENTWICKELN**
- Identifikation und Qualifizierung
- Schrittweise Verantwortungsübertragung
- Strukturen professionalisieren
- Due Diligence vorbereiten

**Phase 3 (Jahr 5+): ÜBERGABE**
- Formale Übergabe zu optimal geplantem Zeitpunkt
- Begleitphase nach Bedarf
- Finanzielle und steuerliche Optimierung voll ausschöpfen
    `
  }

  // ============================================
  // 🎯 NÄCHSTE SCHRITTE (Priorisiert)
  // ============================================
  analyse.naechste_schritte.push(
    '1️⃣ **Notfallplan erstellen**: Vollmachten, Notfall-Testament, Vertretungsregelungen (innerhalb 4 Wochen)',
    '2️⃣ **Rechtliche Basics klären**: Fachanwalt für Gesellschaftsrecht konsultieren',
    '3️⃣ **Steuerberater einschalten**: Nachfolge-Experten mit Schwerpunkt Unternehmensnachfolge',
    '4️⃣ **Grobe Unternehmensbewertung**: Orientierung für Verhandlungen / Finanzplanung',
    '5️⃣ **Familienworkshop**: Erwartungen, Wünsche, Konflikte früh ansprechen'
  )

  if (data.zeitrahmen === 'unter_2_jahre') {
    analyse.naechste_schritte.push(
      '6️⃣ **DRINGEND: Käufersuche / Nachfolger-Entscheidung**: Sie haben wenig Zeit!',
      '7️⃣ **Due Diligence Vorbereitung**: Unterlagen systematisch zusammenstellen'
    )
  } else {
    analyse.naechste_schritte.push(
      '6️⃣ **Nachfolgersuche strukturieren**: Profil definieren, Kandidaten identifizieren',
      '7️⃣ **Unternehmen fit machen**: Prozesse dokumentieren, Bilanz optimieren'
    )
  }

  return analyse
}

// ============================================
// 🎨 HTML TEMPLATES (JSX)
// ============================================

const Layout: FC = ({ children }) => {
  return (
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Unternehmensnachfolge-Berater</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style dangerouslySetInnerHTML={{__html: `
          .typing-indicator {
            display: inline-flex;
            gap: 4px;
          }
          .typing-indicator span {
            width: 8px;
            height: 8px;
            background: #3b82f6;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
          }
          .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
          .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          .fade-in {
            animation: fadeIn 0.5s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </head>
      <body class="bg-gray-50">
        {children}
      </body>
    </html>
  )
}

const ChatPage: FC = () => {
  return (
    <Layout>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div class="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              <i class="fas fa-robot text-blue-600 mr-2"></i>
              Unternehmensnachfolge-Berater
            </h1>
            <p class="text-gray-600 italic">"Emotional, aber planbar - Ihr Weg zur erfolgreichen Übergabe"</p>
            <div class="mt-4">
              <a href="/" class="text-blue-600 hover:text-blue-800 underline">
                <i class="fas fa-file-alt mr-1"></i> Zum klassischen Fragebogen wechseln
              </a>
            </div>
          </div>

          {/* Chat Container */}
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Chat Messages */}
            <div id="chatMessages" class="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50"></div>

            {/* Input Area */}
            <div class="border-t p-4 bg-white">
              <div id="inputArea"></div>
            </div>
          </div>

          {/* Restart Button */}
          <div class="text-center mt-6">
            <button id="restartBtn" class="hidden bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200">
              <i class="fas fa-redo mr-2"></i> Neue Analyse starten
            </button>
          </div>
        </div>
      </div>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        let conversation = [];
        let formData = {};
        let currentQuestionIndex = 0;
        let isAnalyzing = false;

        const questions = ${JSON.stringify(chatbotQuestions)};

        function addMessage(role, content, options = null) {
          const messagesDiv = document.getElementById('chatMessages');
          const messageDiv = document.createElement('div');
          messageDiv.className = \`fade-in \${role === 'bot' ? 'flex justify-start' : 'flex justify-end'}\`;
          
          const bubble = document.createElement('div');
          bubble.className = \`max-w-xl rounded-lg px-4 py-3 \${
            role === 'bot' 
              ? 'bg-blue-100 text-gray-800' 
              : 'bg-blue-600 text-white'
          }\`;
          
          // Parse markdown-like formatting
          let formattedContent = content
            .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
            .replace(/\\n/g, '<br>');
          
          bubble.innerHTML = formattedContent;
          messageDiv.appendChild(bubble);
          messagesDiv.appendChild(messageDiv);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;

          if (options && role === 'bot') {
            setTimeout(() => showOptions(options), 300);
          }
        }

        function showTypingIndicator() {
          const messagesDiv = document.getElementById('chatMessages');
          const typingDiv = document.createElement('div');
          typingDiv.id = 'typingIndicator';
          typingDiv.className = 'fade-in flex justify-start';
          typingDiv.innerHTML = \`
            <div class="bg-blue-100 rounded-lg px-4 py-3">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          \`;
          messagesDiv.appendChild(typingDiv);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function hideTypingIndicator() {
          const indicator = document.getElementById('typingIndicator');
          if (indicator) indicator.remove();
        }

        function showOptions(options) {
          const inputArea = document.getElementById('inputArea');
          inputArea.innerHTML = '';
          
          const optionsDiv = document.createElement('div');
          optionsDiv.className = 'grid grid-cols-1 gap-2';
          
          options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-left';
            btn.textContent = option;
            btn.onclick = () => handleAnswer(option);
            optionsDiv.appendChild(btn);
          });
          
          inputArea.appendChild(optionsDiv);
        }

        function showTextInput(placeholder) {
          const inputArea = document.getElementById('inputArea');
          inputArea.innerHTML = \`
            <div class="flex gap-2">
              <input 
                type="text" 
                id="textInput" 
                placeholder="\${placeholder}"
                class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onclick="submitTextInput()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          \`;
          document.getElementById('textInput').focus();
          document.getElementById('textInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitTextInput();
          });
        }

        window.submitTextInput = function() {
          const input = document.getElementById('textInput');
          const value = input.value.trim();
          if (value) {
            handleAnswer(value);
          }
        }

        async function handleAnswer(answer) {
          if (isAnalyzing) return;
          
          // Add user message
          addMessage('user', answer);
          
          // Store answer
          const question = questions[currentQuestionIndex];
          if (question.field) {
            const mappedValue = mapAnswerToValue(question.id, answer);
            formData[question.field] = isNaN(mappedValue) ? mappedValue : parseInt(mappedValue);
          }
          
          conversation.push({ role: 'user', content: answer });
          
          // Clear input
          document.getElementById('inputArea').innerHTML = '';
          
          // Move to next question
          currentQuestionIndex++;
          
          if (currentQuestionIndex < questions.length) {
            // Skip nachfolgerTyp if no successor
            if (questions[currentQuestionIndex].id === 'nachfolgerTyp' && formData.nachfolgerVorhanden !== 'ja') {
              currentQuestionIndex++;
            }
            
            showTypingIndicator();
            await new Promise(resolve => setTimeout(resolve, 1000));
            hideTypingIndicator();
            
            const nextQuestion = questions[currentQuestionIndex];
            addMessage('bot', nextQuestion.question);
            conversation.push({ role: 'bot', content: nextQuestion.question });
            
            if (nextQuestion.options) {
              showOptions(nextQuestion.options);
            } else {
              showTextInput('Ihre Antwort...');
            }
          } else {
            // All questions answered - generate analysis
            await finalizeAnalysis();
          }
        }

        async function finalizeAnalysis() {
          isAnalyzing = true;
          
          showTypingIndicator();
          await new Promise(resolve => setTimeout(resolve, 1500));
          hideTypingIndicator();
          
          addMessage('bot', 'Vielen Dank! Ich analysiere jetzt Ihre Situation und erstelle personalisierte Empfehlungen für Sie...');
          
          showTypingIndicator();
          
          try {
            const response = await fetch('/api/analyse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            hideTypingIndicator();
            
            // Display results as chat messages
            await displayAnalysisResults(result);
            
            // Show restart button
            document.getElementById('restartBtn').classList.remove('hidden');
            
          } catch (error) {
            hideTypingIndicator();
            addMessage('bot', '❌ Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
          }
          
          isAnalyzing = false;
        }

        async function displayAnalysisResults(analysis) {
          const sections = [
            { title: '📊 Ihre Priorität', content: analysis.prioritaet },
            { title: '❤️ Emotionale Perspektive', content: analysis.perspektiven.emotional.join('\\n\\n') },
            { title: '⚖️ Rechtliche Perspektive', content: analysis.perspektiven.rechtlich.join('\\n\\n') },
            { title: '💰 Steuerliche Perspektive', content: analysis.perspektiven.steuerlich.join('\\n\\n') },
            { title: '📋 Organisatorische Perspektive', content: analysis.perspektiven.organisatorisch.join('\\n\\n') },
            { title: '⚠️ Risiken', content: analysis.risiken.join('\\n') },
            { title: '✅ Chancen', content: analysis.chancen.join('\\n') },
            { title: '📅 Zeitplan', content: analysis.zeitplan },
            { title: '🎯 Nächste Schritte', content: analysis.naechste_schritte.join('\\n\\n') },
            { title: '⭐ Erfolgsfaktoren', content: analysis.erfolgsfaktoren.join('\\n') }
          ];

          for (const section of sections) {
            await new Promise(resolve => setTimeout(resolve, 800));
            addMessage('bot', \`**\${section.title}**\\n\\n\${section.content}\`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          addMessage('bot', '✅ **Ihre Analyse ist vollständig!** Bei Fragen wenden Sie sich bitte an einen Fachanwalt, Steuerberater oder zertifizierten Nachfolgeberater.');
        }

        function mapAnswerToValue(questionId, answer) {
          const mappings = {
            'unternehmensgroesse': {
              'Klein (bis 10 Mitarbeiter)': 'klein',
              'Mittel (10-50 Mitarbeiter)': 'mittel',
              'Groß (über 50 Mitarbeiter)': 'gross'
            },
            'branche': {
              'Handwerk': 'handwerk',
              'Produktion': 'produktion',
              'Handel': 'handel',
              'Dienstleistung': 'dienstleistung',
              'IT/Tech': 'it',
              'Andere': 'andere'
            },
            'jahresumsatz': {
              'Unter 500.000 €': 'unter_500k',
              '500.000 - 2 Mio. €': '500k_2m',
              '2 - 10 Mio. €': '2m_10m',
              'Über 10 Mio. €': 'ueber_10m'
            },
            'familienunternehmen': {
              'Ja': 'ja',
              'Nein': 'nein'
            },
            'nachfolgerVorhanden': {
              'Ja': 'ja',
              'Nein': 'nein',
              'Unklar': 'unklar'
            },
            'nachfolgerTyp': {
              'Familienintern': 'familie',
              'Mitarbeiter/Management': 'mitarbeiter',
              'Externe Person/Unternehmen': 'extern'
            },
            'zeitrahmen': {
              'Unter 2 Jahren': 'unter_2_jahre',
              '2-5 Jahre': '2_5_jahre',
              'Über 5 Jahre': 'ueber_5_jahre'
            },
            'emotionaleBindung': {
              'Sehr hoch': 'sehr_hoch',
              'Hoch': 'hoch',
              'Mittel': 'mittel',
              'Niedrig': 'niedrig'
            },
            'finanzielleErwartungen': {
              'Sehr hoch': 'sehr_hoch',
              'Hoch': 'hoch',
              'Mittel': 'mittel',
              'Niedrig': 'niedrig'
            }
          };
          return mappings[questionId]?.[answer] || answer;
        }

        document.getElementById('restartBtn').onclick = () => {
          location.reload();
        };

        // Start conversation
        window.onload = () => {
          const firstQuestion = questions[0];
          addMessage('bot', firstQuestion.question, firstQuestion.options);
          conversation.push({ role: 'bot', content: firstQuestion.question });
        };
      `}} />
    </Layout>
  )
}

const FormPage: FC = () => {
  return (
    <Layout>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div class="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">
              <i class="fas fa-handshake text-blue-600 mr-2"></i>
              Unternehmensnachfolge-Berater
            </h1>
            <p class="text-gray-600 italic">"Emotional, aber planbar - Ihr Weg zur erfolgreichen Übergabe"</p>
            <div class="mt-4">
              <a href="/chat" class="text-blue-600 hover:text-blue-800 underline">
                <i class="fas fa-robot mr-1"></i> Zum Chatbot-Berater wechseln
              </a>
            </div>
          </div>

          {/* Form Card */}
          <div class="bg-white rounded-lg shadow-lg p-8">
            <form id="nachfolgeForm" class="space-y-6">
              {/* Schritt 1 */}
              <div id="schritt1">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                  <i class="fas fa-building mr-2 text-blue-600"></i>
                  Schritt 1: Unternehmensdaten
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Unternehmensgröße *</label>
                    <select name="unternehmensgroesse" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="klein">Klein (bis 10 Mitarbeiter)</option>
                      <option value="mittel">Mittel (10-50 Mitarbeiter)</option>
                      <option value="gross">Groß (über 50 Mitarbeiter)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Branche *</label>
                    <select name="branche" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="handwerk">Handwerk</option>
                      <option value="produktion">Produktion</option>
                      <option value="handel">Handel</option>
                      <option value="dienstleistung">Dienstleistung</option>
                      <option value="it">IT/Tech</option>
                      <option value="andere">Andere</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Jahresumsatz *</label>
                    <select name="jahresumsatz" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="unter_500k">Unter 500.000 €</option>
                      <option value="500k_2m">500.000 - 2 Mio. €</option>
                      <option value="2m_10m">2 - 10 Mio. €</option>
                      <option value="ueber_10m">Über 10 Mio. €</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Mitarbeiteranzahl *</label>
                    <input type="number" name="mitarbeiteranzahl" min="1" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="z.B. 25" />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Familienunternehmen? *</label>
                    <select name="familienunternehmen" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="ja">Ja</option>
                      <option value="nein">Nein</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Ihr Alter *</label>
                    <input type="number" name="alterInhaber" min="18" max="100" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="z.B. 62" />
                  </div>
                </div>

                <div class="mt-6 flex justify-end">
                  <button type="button" onclick="nextStep()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200">
                    Weiter zu Schritt 2 <i class="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>

              {/* Schritt 2 */}
              <div id="schritt2" class="hidden">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                  <i class="fas fa-users mr-2 text-green-600"></i>
                  Schritt 2: Nachfolgeplanung
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nachfolger vorhanden? *</label>
                    <select name="nachfolgerVorhanden" id="nachfolgerVorhanden" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="ja">Ja</option>
                      <option value="nein">Nein</option>
                      <option value="unklar">Unklar</option>
                    </select>
                  </div>

                  <div id="nachfolgerTypDiv" class="hidden">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Art des Nachfolgers *</label>
                    <select name="nachfolgerTyp" id="nachfolgerTyp" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="familie">Familienintern</option>
                      <option value="mitarbeiter">Mitarbeiter/Management</option>
                      <option value="extern">Externe Person/Unternehmen</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Zeitrahmen der Übergabe *</label>
                    <select name="zeitrahmen" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="unter_2_jahre">Unter 2 Jahren</option>
                      <option value="2_5_jahre">2-5 Jahre</option>
                      <option value="ueber_5_jahre">Über 5 Jahre</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Emotionale Bindung *</label>
                    <select name="emotionaleBindung" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="sehr_hoch">Sehr hoch</option>
                      <option value="hoch">Hoch</option>
                      <option value="mittel">Mittel</option>
                      <option value="niedrig">Niedrig</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Finanzielle Erwartungen *</label>
                    <select name="finanzielleErwartungen" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Bitte wählen...</option>
                      <option value="sehr_hoch">Sehr hoch</option>
                      <option value="hoch">Hoch</option>
                      <option value="mittel">Mittel</option>
                      <option value="niedrig">Niedrig</option>
                    </select>
                  </div>
                </div>

                <div class="mt-6 flex justify-between">
                  <button type="button" onclick="prevStep()" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200">
                    <i class="fas fa-arrow-left mr-2"></i> Zurück
                  </button>
                  <button type="submit" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200">
                    <i class="fas fa-chart-line mr-2"></i> Analyse starten
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results */}
          <div id="results" class="hidden mt-8"></div>
        </div>
      </div>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        document.getElementById('nachfolgerVorhanden').addEventListener('change', function() {
          const nachfolgerTypDiv = document.getElementById('nachfolgerTypDiv');
          const nachfolgerTyp = document.getElementById('nachfolgerTyp');
          if (this.value === 'ja') {
            nachfolgerTypDiv.classList.remove('hidden');
            nachfolgerTyp.required = true;
          } else {
            nachfolgerTypDiv.classList.add('hidden');
            nachfolgerTyp.required = false;
            nachfolgerTyp.value = '';
          }
        });

        function nextStep() {
          const schritt1 = document.getElementById('schritt1');
          const requiredFields = schritt1.querySelectorAll('[required]');
          let valid = true;
          
          requiredFields.forEach(field => {
            if (!field.value) {
              valid = false;
              field.classList.add('border-red-500');
            } else {
              field.classList.remove('border-red-500');
            }
          });

          if (valid) {
            schritt1.classList.add('hidden');
            document.getElementById('schritt2').classList.remove('hidden');
            window.scrollTo(0, 0);
          } else {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
          }
        }

        function prevStep() {
          document.getElementById('schritt2').classList.add('hidden');
          document.getElementById('schritt1').classList.remove('hidden');
          window.scrollTo(0, 0);
        }

        document.getElementById('nachfolgeForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = {
            unternehmensgroesse: formData.get('unternehmensgroesse'),
            branche: formData.get('branche'),
            jahresumsatz: formData.get('jahresumsatz'),
            mitarbeiteranzahl: parseInt(formData.get('mitarbeiteranzahl')),
            familienunternehmen: formData.get('familienunternehmen'),
            nachfolgerVorhanden: formData.get('nachfolgerVorhanden'),
            nachfolgerTyp: formData.get('nachfolgerTyp') || undefined,
            zeitrahmen: formData.get('zeitrahmen'),
            alterInhaber: parseInt(formData.get('alterInhaber')),
            emotionaleBindung: formData.get('emotionaleBindung'),
            finanzielleErwartungen: formData.get('finanzielleErwartungen')
          };

          try {
            const response = await fetch('/api/analyse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            const result = await response.json();
            displayResults(result);
          } catch (error) {
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
          }
        });

        function displayResults(analysis) {
          const resultsDiv = document.getElementById('results');
          resultsDiv.innerHTML = \`
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                Ihre persönliche Nachfolge-Analyse
              </h2>

              <!-- Priorität -->
              <div class="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <h3 class="text-xl font-bold text-gray-800 mb-2">
                  <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                  Handlungspriorität
                </h3>
                <p class="text-gray-700">\${analysis.prioritaet}</p>
              </div>

              <!-- Perspektiven -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="p-6 bg-red-50 border-l-4 border-red-500 rounded">
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-heart text-red-600 mr-2"></i>
                    Emotional
                  </h3>
                  <ul class="space-y-2">
                    \${analysis.perspektiven.emotional.map(p => \`<li class="text-gray-700">\${p}</li>\`).join('')}
                  </ul>
                </div>

                <div class="p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-balance-scale text-blue-600 mr-2"></i>
                    Rechtlich
                  </h3>
                  <ul class="space-y-2">
                    \${analysis.perspektiven.rechtlich.map(p => \`<li class="text-gray-700">\${p}</li>\`).join('')}
                  </ul>
                </div>

                <div class="p-6 bg-green-50 border-l-4 border-green-500 rounded">
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-coins text-green-600 mr-2"></i>
                    Steuerlich
                  </h3>
                  <ul class="space-y-2">
                    \${analysis.perspektiven.steuerlich.map(p => \`<li class="text-gray-700">\${p}</li>\`).join('')}
                  </ul>
                </div>

                <div class="p-6 bg-purple-50 border-l-4 border-purple-500 rounded">
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-cogs text-purple-600 mr-2"></i>
                    Organisatorisch
                  </h3>
                  <ul class="space-y-2">
                    \${analysis.perspektiven.organisatorisch.map(p => \`<li class="text-gray-700">\${p}</li>\`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Risiken & Chancen -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="p-6 bg-orange-50 border-l-4 border-orange-500 rounded">
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-exclamation-triangle text-orange-600 mr-2"></i>
                    Risiken
                  </h3>
                  <ul class="space-y-2">
                    \${analysis.risiken.map(r => \`<li class="text-gray-700">\${r}</li>\`).join('')}
                  </ul>
                </div>

                <div class="p-6 bg-teal-50 border-l-4 border-teal-500 rounded">
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-star text-teal-600 mr-2"></i>
                    Chancen
                  </h3>
                  <ul class="space-y-2">
                    \${analysis.chancen.map(c => \`<li class="text-gray-700">\${c}</li>\`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Zeitplan -->
              <div class="mb-8 p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                <h3 class="text-lg font-bold text-gray-800 mb-3">
                  <i class="fas fa-calendar text-indigo-600 mr-2"></i>
                  Zeitplan
                </h3>
                <pre class="text-gray-700 whitespace-pre-wrap font-sans">\${analysis.zeitplan}</pre>
              </div>

              <!-- Nächste Schritte -->
              <div class="mb-8 p-6 bg-pink-50 border-l-4 border-pink-500 rounded">
                <h3 class="text-lg font-bold text-gray-800 mb-3">
                  <i class="fas fa-tasks text-pink-600 mr-2"></i>
                  Nächste Schritte
                </h3>
                <ul class="space-y-2">
                  \${analysis.naechste_schritte.map(s => \`<li class="text-gray-700">\${s}</li>\`).join('')}
                </ul>
              </div>

              <!-- Erfolgsfaktoren -->
              <div class="mb-8 p-6 bg-cyan-50 border-l-4 border-cyan-500 rounded">
                <h3 class="text-lg font-bold text-gray-800 mb-3">
                  <i class="fas fa-trophy text-cyan-600 mr-2"></i>
                  Erfolgsfaktoren
                </h3>
                <ul class="space-y-2">
                  \${analysis.erfolgsfaktoren.map(f => \`<li class="text-gray-700">\${f}</li>\`).join('')}
                </ul>
              </div>

              <!-- Actions -->
              <div class="text-center">
                <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200 mr-4">
                  <i class="fas fa-print mr-2"></i> Drucken
                </button>
                <button onclick="location.reload()" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200">
                  <i class="fas fa-redo mr-2"></i> Neue Analyse
                </button>
              </div>
            </div>
          \`;
          
          resultsDiv.classList.remove('hidden');
          document.getElementById('schritt2').classList.add('hidden');
          window.scrollTo({ top: resultsDiv.offsetTop - 50, behavior: 'smooth' });
        }
      `}} />
    </Layout>
  )
}

// ============================================
// 🌐 ROUTES
// ============================================

// Home - Fragebogen
app.get('/', (c) => {
  return c.html(<FormPage />)
})

// Chat - Chatbot Interface
app.get('/chat', (c) => {
  return c.html(<ChatPage />)
})

// API - Analyse
app.post('/api/analyse', async (c) => {
  try {
    const data = await c.req.json<FormData>()
    const analyse = analyseUnternehmensnachfolge(data)
    return c.json(analyse)
  } catch (error) {
    return c.json({ error: 'Fehler bei der Analyse' }, 400)
  }
})

// API - Statistiken
app.get('/api/statistiken', (c) => {
  return c.json({
    statistiken: {
      kein_nachfolger: '59% finden keinen passenden Nachfolger',
      verkauf_geplant: '48% planen externen Verkauf',
      familienintern: '34% übergeben innerhalb der Familie',
      mbo: '19% übergeben an Mitarbeiter',
      finanzierungsprobleme: '48% haben Finanzierungsschwierigkeiten',
      ueberzogene_preise: '34% scheitern an überzogenen Preisvorstellungen'
    }
  })
})

export default app
