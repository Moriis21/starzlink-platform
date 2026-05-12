import { MessageCircle } from "lucide-react";

const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17";

export default function WhatsAppBanner() {
  return (
    <section className="bg-gradient-to-r from-[#075E54] to-[#128C7E] py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-9 h-9 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white text-2xl font-bold mb-1">Join Our Official WhatsApp Channel!</h3>
          <p className="text-green-100 text-sm">
            Get the latest job opportunities, scholarships, trainings, and campus updates directly on WhatsApp.
            Stay informed, never miss out!
          </p>
        </div>
        <a
          href={WHATSAPP_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-[#075E54] font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg whitespace-nowrap"
        >
          <MessageCircle className="w-5 h-5" />
          Join Now →
        </a>
      </div>
    </section>
  );
}
