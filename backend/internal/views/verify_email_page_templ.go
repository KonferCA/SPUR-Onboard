// Code generated by templ - DO NOT EDIT.

// templ: version: v0.3.833
package views

//lint:file-ignore SA4006 This context is only used if a nested component is present.

import "github.com/a-h/templ"
import templruntime "github.com/a-h/templ/runtime"

type VerifyEmailPageVariant string

const (
	SuccessVerifyEmailPage VerifyEmailPageVariant = "success"
	FailVerifyEmailPage    VerifyEmailPageVariant = "fail"
	InternalErrorEmailPage VerifyEmailPageVariant = "internal"
)

func main() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`background-color:#f8fafc;`)
	templ_7745c5c3_CSSBuilder.WriteString(`height:100vh;`)
	templ_7745c5c3_CSSBuilder.WriteString(`display:flex;`)
	templ_7745c5c3_CSSBuilder.WriteString(`flex-direction:column;`)
	templ_7745c5c3_CSSBuilder.WriteString(`justify-content:center;`)
	templ_7745c5c3_CSSBuilder.WriteString(`align-items:center;`)
	templ_7745c5c3_CSSID := templ.CSSID(`main`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func logo() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`height:2.5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`margin-bottom:1.5rem;`)
	templ_7745c5c3_CSSID := templ.CSSID(`logo`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func xIcon() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`width:5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`height:5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`color:#dc2626;`)
	templ_7745c5c3_CSSBuilder.WriteString(`margin:0.5rem 0;`)
	templ_7745c5c3_CSSID := templ.CSSID(`xIcon`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func checkIcon() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`width:5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`height:5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`color:#22c55e;`)
	templ_7745c5c3_CSSBuilder.WriteString(`margin:0.5rem 0;`)
	templ_7745c5c3_CSSID := templ.CSSID(`checkIcon`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func warningIcon() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`width:5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`height:5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`color:#F4802F;`)
	templ_7745c5c3_CSSBuilder.WriteString(`margin:0.5rem 0;`)
	templ_7745c5c3_CSSID := templ.CSSID(`warningIcon`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func card() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`padding:2.5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`border-radius:0.5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`background-color:white;`)
	templ_7745c5c3_CSSBuilder.WriteString(`box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);`)
	templ_7745c5c3_CSSBuilder.WriteString(`max-width:28rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`width:100%;`)
	templ_7745c5c3_CSSID := templ.CSSID(`card`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func cardContent() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`display:flex;`)
	templ_7745c5c3_CSSBuilder.WriteString(`flex-direction:column;`)
	templ_7745c5c3_CSSBuilder.WriteString(`align-items:center;`)
	templ_7745c5c3_CSSBuilder.WriteString(`color:#4b5563;`)
	templ_7745c5c3_CSSBuilder.WriteString(`text-align:center;`)
	templ_7745c5c3_CSSID := templ.CSSID(`cardContent`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func button() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`text-decoration:none;`)
	templ_7745c5c3_CSSBuilder.WriteString(`color:white;`)
	templ_7745c5c3_CSSBuilder.WriteString(`padding:0.75rem 1.5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`background-color:#F4802F;`)
	templ_7745c5c3_CSSBuilder.WriteString(`border-radius:0.375rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`font-weight:500;`)
	templ_7745c5c3_CSSBuilder.WriteString(`display:inline-block;`)
	templ_7745c5c3_CSSBuilder.WriteString(`transition:background-color 0.2s;`)
	templ_7745c5c3_CSSID := templ.CSSID(`button`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func buttonHover() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`background-color:#D2691F;`)
	templ_7745c5c3_CSSID := templ.CSSID(`buttonHover`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func cardFooter() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`display:flex;`)
	templ_7745c5c3_CSSBuilder.WriteString(`justify-content:center;`)
	templ_7745c5c3_CSSBuilder.WriteString(`align-items:center;`)
	templ_7745c5c3_CSSBuilder.WriteString(`margin-top:2rem;`)
	templ_7745c5c3_CSSID := templ.CSSID(`cardFooter`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func title() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`font-size:1.5rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`line-height:2rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`font-weight:600;`)
	templ_7745c5c3_CSSBuilder.WriteString(`color:#111827;`)
	templ_7745c5c3_CSSBuilder.WriteString(`margin-bottom:1rem;`)
	templ_7745c5c3_CSSID := templ.CSSID(`title`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func contentText() templ.CSSClass {
	templ_7745c5c3_CSSBuilder := templruntime.GetBuilder()
	templ_7745c5c3_CSSBuilder.WriteString(`margin-top:1rem;`)
	templ_7745c5c3_CSSBuilder.WriteString(`line-height:1.5rem;`)
	templ_7745c5c3_CSSID := templ.CSSID(`contentText`, templ_7745c5c3_CSSBuilder.String())
	return templ.ComponentCSSClass{
		ID:    templ_7745c5c3_CSSID,
		Class: templ.SafeCSS(`.` + templ_7745c5c3_CSSID + `{` + templ_7745c5c3_CSSBuilder.String() + `}`),
	}
}

func VerifyEmailPage(variant VerifyEmailPageVariant, url string, details string) templ.Component {
	return templruntime.GeneratedTemplate(func(templ_7745c5c3_Input templruntime.GeneratedComponentInput) (templ_7745c5c3_Err error) {
		templ_7745c5c3_W, ctx := templ_7745c5c3_Input.Writer, templ_7745c5c3_Input.Context
		if templ_7745c5c3_CtxErr := ctx.Err(); templ_7745c5c3_CtxErr != nil {
			return templ_7745c5c3_CtxErr
		}
		templ_7745c5c3_Buffer, templ_7745c5c3_IsBuffer := templruntime.GetBuffer(templ_7745c5c3_W)
		if !templ_7745c5c3_IsBuffer {
			defer func() {
				templ_7745c5c3_BufErr := templruntime.ReleaseBuffer(templ_7745c5c3_Buffer)
				if templ_7745c5c3_Err == nil {
					templ_7745c5c3_Err = templ_7745c5c3_BufErr
				}
			}()
		}
		ctx = templ.InitializeContext(ctx)
		templ_7745c5c3_Var1 := templ.GetChildren(ctx)
		if templ_7745c5c3_Var1 == nil {
			templ_7745c5c3_Var1 = templ.NopComponent
		}
		ctx = templ.ClearChildren(ctx)
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 1, "<!doctype html><html lang=\"en\"><head><link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><meta charset=\"UTF-8\"><title>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var2 string
		templ_7745c5c3_Var2, templ_7745c5c3_Err = templ.JoinStringErrs(getTitle(variant))
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 105, Col: 29}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var2))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 2, "</title><link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin><link href=\"https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&amp;display=swap\" rel=\"stylesheet\"><style type=\"text/css\">\n                * {\n                    margin: 0;\n                    padding: 0;\n                    font-family: 'Kanit', sans-serif;\n                    box-sizing: border-box;\n                }\n                body {\n                    margin: 0;\n                    font-family: 'Kanit', sans-serif;\n                }\n                h3 {\n                    text-align: center;\n                }\n                .space-y > * + * {\n                    margin-top: 1rem;\n                }\n                a.button:hover {\n                    background-color: #D2691F;\n                }\n                @media (max-width: 640px) {\n                    .card {\n                        margin: 1rem;\n                        max-width: 100%;\n                        padding: 1.5rem !important; \n                    }\n                    .logo {\n                        height: 2rem !important; \n                        margin-bottom: 1rem !important; \n                    }\n                    .title {\n                        font-size: 1.25rem !important; \n                    }\n                    .icon {\n                        width: 4rem !important; \n                        height: 4rem !important;\n                        margin: 0.25rem 0 !important; \n                    }\n                    .content-text {\n                        font-size: 0.875rem !important; \n                    }\n                    .button {\n                        padding: 0.5rem 1.25rem !important; \n                        font-size: 0.875rem !important;\n                    }\n                    .card-footer {\n                        margin-top: 1.5rem !important; \n                    }\n                }\n            </style></head><body>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var3 = []any{main()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var3...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 3, "<main class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var4 string
		templ_7745c5c3_Var4, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var3).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var4))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 4, "\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var5 = []any{card()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var5...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 5, "<div class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var6 string
		templ_7745c5c3_Var6, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var5).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var6))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 6, "\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var7 = []any{cardContent()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var7...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 7, "<div class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var8 string
		templ_7745c5c3_Var8, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var7).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var8))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 8, "\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var9 = []any{logo()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var9...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 9, "<svg class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var10 string
		templ_7745c5c3_Var10, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var9).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var10))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 10, "\" width=\"45\" height=\"40\" viewBox=\"0 0 45 40\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M16.0284 10.6147C12.4164 16.9225 8.95484 23.2302 5.34281 29.5379C5.1923 29.384 5.0418 29.2302 5.0418 29.0763C3.38629 26.3071 1.88127 23.5379 0.225752 20.6148C-0.0752508 20.1532 -0.0752508 19.6917 0.225752 19.2302C1.73077 16.6148 3.23578 13.9994 4.5903 11.384C4.8913 10.7686 5.34281 10.6147 6.09531 10.6147C9.10534 10.6147 12.1154 10.6147 15.1254 10.6147C15.4264 10.6147 15.5769 10.6147 16.0284 10.6147Z\" fill=\"#1A1A1A\"></path> <path d=\"M39.6572 10.4619C39.8077 10.7696 39.9582 10.9235 40.1087 11.0773C41.6137 13.8465 43.1187 16.4619 44.7742 19.2312C45.0752 19.8466 45.0752 20.3081 44.7742 20.7696C43.2692 23.385 41.7642 26.0004 40.4097 28.6158C40.1087 29.0774 39.8077 29.385 39.3562 29.385C36.1957 29.385 32.8846 29.385 29.7241 29.385C29.5736 29.385 29.5736 29.385 29.2726 29.385C32.4331 23.0773 36.0452 16.7696 39.6572 10.4619Z\" fill=\"#1A1A1A\"></path> <path d=\"M17.8344 30.4619C24.908 30.4619 31.9816 30.4619 39.0551 30.4619C38.6036 31.385 38.1521 32.1542 37.5501 33.0773C36.3461 35.0773 35.1421 37.2312 34.0886 39.2312C33.7876 39.6927 33.4866 39.8466 33.0351 39.8466C30.025 39.8466 26.8645 39.8466 23.8545 39.8466C23.403 39.8466 22.9515 39.6927 22.801 39.2312C21.2959 36.4619 19.6404 33.6927 18.1354 30.9235C17.9849 30.9235 17.9849 30.7696 17.8344 30.4619Z\" fill=\"#1A1A1A\"></path> <path d=\"M22.9515 0C23.2525 0 23.403 0 23.704 0C26.714 0 29.7241 0 32.7341 0C33.3361 0 33.7876 0.307693 34.0886 0.769233C35.5936 3.38463 36.9482 6.00002 38.4532 8.61541C38.7542 9.07695 38.7542 9.53849 38.4532 10C36.7977 12.9231 35.1421 15.8462 33.6371 18.6154C33.6371 18.6154 33.6371 18.6154 33.4866 18.7693C30.0251 12.6154 26.5635 6.30771 22.9515 0Z\" fill=\"#1A1A1A\"></path> <path d=\"M5.94479 9.38465C6.0953 9.07695 6.09529 8.92311 6.2458 8.76926C7.75081 6.15387 9.25583 3.38463 10.7608 0.769233C11.0618 0.153847 11.5134 0 12.1154 0C14.9749 0 17.9849 0 20.8445 0C21.4465 0 21.898 0.153847 22.199 0.769233C23.8545 3.69232 25.51 6.46156 27.1655 9.53849C20.0919 9.38465 13.0184 9.38465 5.94479 9.38465Z\" fill=\"#1A1A1A\"></path> <path d=\"M21.8979 39.9998C21.4464 39.9998 21.1454 39.9998 20.6939 39.9998C17.6839 39.9998 14.8243 39.9998 11.8143 39.9998C11.3628 39.9998 10.9113 39.846 10.7608 39.3844C9.25577 36.7691 7.75076 34.1537 6.24574 31.3844C5.94474 30.9229 5.94474 30.4613 6.24574 29.846C7.75076 27.0767 9.25577 24.3075 10.9113 21.5382C11.0618 21.3844 11.0618 21.2305 11.2123 20.9229C14.8243 27.3844 18.2859 33.5383 21.8979 39.9998Z\" fill=\"#1A1A1A\"></path></svg>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var11 = []any{title()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var11...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 11, "<h3 class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var12 string
		templ_7745c5c3_Var12, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var11).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var12))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 12, "\" data-testid=\"card-title\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var13 string
		templ_7745c5c3_Var13, templ_7745c5c3_Err = templ.JoinStringErrs(getCardTitle(variant))
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 173, Col: 76}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var13))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 13, "</h3>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var14 = []any{"space-y", cardContent()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var14...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 14, "<div class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var15 string
		templ_7745c5c3_Var15, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var14).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var15))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 15, "\" data-testid=\"card-content-container\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if variant == SuccessVerifyEmailPage {
			var templ_7745c5c3_Var16 = []any{checkIcon()}
			templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var16...)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 16, "<svg fill=\"#000000\" width=\"800px\" height=\"800px\" viewBox=\"0 0 24 24\" id=\"check-mark-circle-2\" xmlns=\"http://www.w3.org/2000/svg\" class=\"")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var17 string
			templ_7745c5c3_Var17, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var16).String())
			if templ_7745c5c3_Err != nil {
				return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var17))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 17, "\" data-testid=\"check-icon\"><path id=\"primary\" d=\"M20.94,11A8.26,8.26,0,0,1,21,12a9,9,0,1,1-9-9,8.83,8.83,0,0,1,4,1\" style=\"fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5;\"></path><polyline id=\"primary-2\" data-name=\"primary\" points=\"21 5 12 14 8 10\" style=\"fill: none; stroke: rgb(0, 0, 0); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5;\"></polyline></svg>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		} else if variant == FailVerifyEmailPage {
			var templ_7745c5c3_Var18 = []any{xIcon()}
			templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var18...)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 18, "<svg viewBox=\"0 0 24 24\" class=\"")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var19 string
			templ_7745c5c3_Var19, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var18).String())
			if templ_7745c5c3_Err != nil {
				return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var19))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 19, "\" data-testid=\"x-icon\"><circle cx=\"12\" cy=\"12\" r=\"11\" fill=\"#FDEDED\" stroke=\"#dc2626\" stroke-width=\"0.5\"></circle> <path d=\"M8 8L16 16\" stroke=\"#dc2626\" stroke-width=\"2.5\" stroke-linecap=\"round\"></path> <path d=\"M16 8L8 16\" stroke=\"#dc2626\" stroke-width=\"2.5\" stroke-linecap=\"round\"></path></svg>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		} else {
			var templ_7745c5c3_Var20 = []any{warningIcon()}
			templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var20...)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 20, "<svg viewBox=\"0 0 24 24\" class=\"")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var21 string
			templ_7745c5c3_Var21, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var20).String())
			if templ_7745c5c3_Err != nil {
				return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var21))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 21, "\" data-testid=\"warning-icon\"><path d=\"M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z\" fill=\"#FEF5ED\" stroke=\"#F4802F\" stroke-width=\"0.5\"></path> <path d=\"M12 8V12\" stroke=\"#F4802F\" stroke-width=\"2.5\" stroke-linecap=\"round\"></path> <circle cx=\"12\" cy=\"16\" r=\"1.25\" fill=\"#F4802F\"></circle></svg>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		var templ_7745c5c3_Var22 = []any{contentText()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var22...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 22, "<p class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var23 string
		templ_7745c5c3_Var23, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var22).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var23))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 23, "\" data-testid=\"card-details\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if details == "" {
			var templ_7745c5c3_Var24 string
			templ_7745c5c3_Var24, templ_7745c5c3_Err = templ.JoinStringErrs(getCardContent(variant))
			if templ_7745c5c3_Err != nil {
				return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 194, Col: 34}
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var24))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		} else {
			var templ_7745c5c3_Var25 string
			templ_7745c5c3_Var25, templ_7745c5c3_Err = templ.JoinStringErrs(details)
			if templ_7745c5c3_Err != nil {
				return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 196, Col: 18}
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var25))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 24, "</p></div>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var26 = []any{cardFooter()}
		templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var26...)
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 25, "<div class=\"")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		var templ_7745c5c3_Var27 string
		templ_7745c5c3_Var27, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var26).String())
		if templ_7745c5c3_Err != nil {
			return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
		}
		_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var27))
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 26, "\" data-testid=\"card-footer\">")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		if variant != InternalErrorEmailPage {
			var templ_7745c5c3_Var28 = []any{button()}
			templ_7745c5c3_Err = templ.RenderCSSItems(ctx, templ_7745c5c3_Buffer, templ_7745c5c3_Var28...)
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 27, "<a data-testid=\"go-to-dashboard\" href=\"")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var29 templ.SafeURL = templ.SafeURL(url)
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(string(templ_7745c5c3_Var29)))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 28, "\" class=\"")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			var templ_7745c5c3_Var30 string
			templ_7745c5c3_Var30, templ_7745c5c3_Err = templ.JoinStringErrs(templ.CSSClasses(templ_7745c5c3_Var28).String())
			if templ_7745c5c3_Err != nil {
				return templ.Error{Err: templ_7745c5c3_Err, FileName: `verify_email_page.templ`, Line: 1, Col: 0}
			}
			_, templ_7745c5c3_Err = templ_7745c5c3_Buffer.WriteString(templ.EscapeString(templ_7745c5c3_Var30))
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
			templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 29, "\">Go to Dashboard</a>")
			if templ_7745c5c3_Err != nil {
				return templ_7745c5c3_Err
			}
		}
		templ_7745c5c3_Err = templruntime.WriteString(templ_7745c5c3_Buffer, 30, "</div></div></div></main></body></html>")
		if templ_7745c5c3_Err != nil {
			return templ_7745c5c3_Err
		}
		return nil
	})
}

func getTitle(variant VerifyEmailPageVariant) string {
	switch variant {
	case SuccessVerifyEmailPage:
		return "Email Verified Successfully"
	case FailVerifyEmailPage:
		return "Email Not Verified"
	}

	return "Oops... Something went wrong"
}

func getCardTitle(variant VerifyEmailPageVariant) string {
	switch variant {
	case SuccessVerifyEmailPage:
		return "Email Verified Successfully"
	case FailVerifyEmailPage:
		return "Failed to Verify Email"
	}

	return "Oops... Something went wrong"
}

func getCardContent(variant VerifyEmailPageVariant) string {
	switch variant {
	case SuccessVerifyEmailPage:
		return "Thank you for verifying your email address. You can now close this window or click the button below to go to your dashboard."
	case FailVerifyEmailPage:
		return "Please try again by requesting a new verification email. If the problem persists, please try again later."
	}

	return "We encountered an unexpected error while processing your request. Please try again later or contact us if the issue persists."
}

var _ = templruntime.GeneratedTemplate
