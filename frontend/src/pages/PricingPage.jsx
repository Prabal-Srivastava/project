import { Check, Zap, Shield, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingPage = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for students and hobbyists to explore the platform.",
      features: [
        "6 Programming Languages",
        "5s Execution Time Limit",
        "128MB RAM Sandbox",
        "Up to 10 Projects",
        "Community Support"
      ],
      buttonText: "Start Coding",
      highlight: false
    },
    {
      name: "Pro",
      price: "19",
      description: "Ideal for professional developers and coding instructors.",
      features: [
        "Everything in Free",
        "30s Execution Time Limit",
        "1GB RAM Sandbox",
        "Unlimited Projects",
        "API Access (Restricted)",
        "Priority Support"
      ],
      buttonText: "Go Pro",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "99",
      description: "Built for scaling education platforms and hackathons.",
      features: [
        "Everything in Pro",
        "Custom Sandbox Images",
        "Full API Integration",
        "Team Collaboration",
        "SLA Guarantee",
        "24/7 Dedicated Support"
      ],
      buttonText: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="flex-1 py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
              Simple, Transparent <br />
              <span className="text-indigo-500">Pricing.</span>
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto font-medium">
              Choose the plan that's right for your projects. Upgrade or downgrade at any time.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-[2.5rem] border flex flex-col justify-between transition-all ${
                plan.highlight 
                  ? 'bg-zinc-900 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' 
                  : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      Recommended
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white tracking-tight">${plan.price}</span>
                  <span className="text-zinc-500 text-sm font-medium">/month</span>
                </div>
                
                <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-12">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                        <Check size={12} className="text-indigo-500" />
                      </div>
                      <span className="text-sm text-zinc-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 group ${
                plan.highlight 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 active:scale-95'
              }`}>
                <span>{plan.buttonText}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
