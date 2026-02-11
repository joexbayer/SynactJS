export class TimeOfDayService {
    getNow() {
        return new Date();
    }

    getDayPart(date = this.getNow()) {
        const hour = date.getHours();

        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 18) return "afternoon";
        if (hour >= 18 && hour < 22) return "evening";
        return "night";
    }

    formatClock(date = this.getNow(), locale = undefined) {
        return date.toLocaleTimeString(locale, {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    formatDate(date = this.getNow(), locale = undefined) {
        return date.toLocaleDateString(locale, {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
    }

    formatHeaderLabel(date = this.getNow(), locale = undefined) {
        const dayPart = this.getDayPart(date);
        return `${this.formatDate(date, locale)} • ${this.formatClock(date, locale)} • ${dayPart}`;
    }

    startTicker(onTick, intervalMs = 60 * 1000) {
        if (typeof onTick !== "function") {
            return () => {};
        }

        onTick(this.getNow());

        const timer = setInterval(() => {
            onTick(this.getNow());
        }, Math.max(1000, Number(intervalMs) || 60 * 1000));

        return () => clearInterval(timer);
    }
}
