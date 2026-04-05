# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'NVGIF reference implementations'
copyright = '2026, tiash-and-cats & contributors'
author = 'tiash-and-cats & contributors'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx_csharp.csharp', 'javasphinx']

templates_path = ['_templates']
exclude_patterns = []

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = "nvgif"
html_theme_path = ["_themes"]
html_static_path = ['_static']

# -- Javasphinx options ------------------------------------------------------

javadoc_url_map = {
    "java.base": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.base/", "javadoc"),
    "java.compiler": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.compiler/", "javadoc"),
    "java.datatransfer": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.datatransfer/", "javadoc"),
    "java.desktop": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.desktop/", "javadoc"),
    "java.instrument": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.instrument/", "javadoc"),
    "java.logging": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.logging/", "javadoc"),
    "java.management": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.management/", "javadoc"),
    "java.management.rmi": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.management.rmi/", "javadoc"),
    "java.naming": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.naming/", "javadoc"),
    "java.net.http": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.net.http/", "javadoc"),
    "java.prefs": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.prefs/", "javadoc"),
    "java.rmi": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.rmi/", "javadoc"),
    "java.scripting": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.scripting/", "javadoc"),
    "java.se": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.se/", "javadoc"),
    "java.security.jgss": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.security.jgss/", "javadoc"),
    "java.security.sasl": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.security.sasl/", "javadoc"),
    "java.smartcardio": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.smartcardio/", "javadoc"),
    "java.sql": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/", "javadoc"),
    "java.sql.rowset": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.sql.rowset/", "javadoc"),
    "java.transaction.xa": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.transaction.xa/", "javadoc"),
    "java.xml": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.xml/", "javadoc"),
    "java.xml.crypto": ("https://docs.oracle.com/en/java/javase/25/docs/api/java.xml.crypto/", "javadoc"),
}