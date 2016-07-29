package log

import (
	"bytes"
	"fmt"
	"os"

	log15 "gopkg.in/inconshreveable/log15.v2"
)

type LogLevel log15.Lvl

const (
	DEBUG    = LogLevel(log15.LvlDebug)
	INFO     = LogLevel(log15.LvlInfo)
	WARN     = LogLevel(log15.LvlWarn)
	ERROR    = LogLevel(log15.LvlError)
	CRITICAL = LogLevel(log15.LvlCrit)

	timeNoDateFormat = "15:04:05"
	termMsgJust      = 40
)

// Returns the name of a Lvl
func LevelTag(l LogLevel) string {
	switch l {
	case DEBUG:
		return "D"
	case INFO:
		return "I"
	case WARN:
		return "W"
	case ERROR:
		return "E"
	case CRITICAL:
		return "X"
	default:
		panic("bad level")
	}
}

func TerminalFormat() log15.Format {
	return log15.FormatFunc(func(r *log15.Record) []byte {
		b := &bytes.Buffer{}

		level := LogLevel(r.Lvl)
		fmt.Fprintf(b, "[%s][%s] %s", LevelTag(level), r.Time.Format(timeNoDateFormat), r.Msg)

		// try to justify the log output for short messages
		if len(r.Ctx) > 0 && len(r.Msg) < termMsgJust {
			b.Write(bytes.Repeat([]byte{' '}, termMsgJust-len(r.Msg)))
		}

		// print the keys logfmt style
		printLogCtx(b, r.Ctx)
		return b.Bytes()
	})
}

func New(lvl LogLevel) log15.Logger {
	handler := log15.LvlFilterHandler(
		log15.Lvl(lvl),
		log15.CallerFileHandler(
			log15.StreamHandler(os.Stdout, TerminalFormat())))

	logger := log15.New()
	logger.SetHandler(handler)
	return logger
}

// A simplified version of {log15.logfmt}.
func printLogCtx(buf *bytes.Buffer, ctx []interface{}) {
	for i := 0; i < len(ctx); i += 2 {
		k, ok := ctx[i].(string)
		v := fmt.Sprintf("%+v", ctx[i+1])
		if !ok {
			k, v = "ERR", fmt.Sprintf("%+v", k)
		}

		fmt.Fprintf(buf, " %s=%s", k, v)
	}
	buf.WriteByte('\n')
}
